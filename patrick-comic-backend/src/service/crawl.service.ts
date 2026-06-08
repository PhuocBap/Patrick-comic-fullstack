// src/service/crawl.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { ChuongService } from './chuong.service';
import { TruyenService } from './truyen.service'; 
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as https from 'https';
import * as dns from 'dns'; 
// SỬA: Thay đổi import sang puppeteer-extra để dùng Plugin Stealth chống chặn
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Kích hoạt tính năng tàng hình chống Cloudflare Connection Closed
puppeteer.use(StealthPlugin());

interface ChapterItem {
  url: string;
  soChuong: number;
  tenChuong: string;
}

@Injectable()
export class CrawlService {
  constructor(
    private readonly chuongService: ChuongService,
    private readonly truyenService: TruyenService, 
  ) {}

  private readonly customResolver = (() => {
    const resolver = new dns.promises.Resolver();
    resolver.setServers(['8.8.8.8', '8.8.4.4']);
    return resolver;
  })();

  private createBypassAgent(): https.Agent {
    return new https.Agent({
      rejectUnauthorized: false,
      keepAlive: true, 
      lookup: async (hostname, options, callback) => {
        try {
          const addresses = await this.customResolver.resolve4(hostname).catch(() => []);
          if (addresses && addresses.length > 0) {
            return callback(null, addresses[0], 4);
          }
          return dns.lookup(hostname, options, callback);
        } catch (error: any) {
          return dns.lookup(hostname, options, callback);
        }
      }
    });
  }

  // TỐI ƯU: Cấu hình trình duyệt tàng hình, tự dọn dẹp bộ nhớ tránh rò rỉ RAM gây ngắt kết nối
  private async getHtmlBypassCloudflare(url: string, sharedBrowser?: any): Promise<string> {
    const isShared = !!sharedBrowser;
    const browser = sharedBrowser || await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage', // TỐI ƯU: Tránh tràn bộ nhớ đệm dùng chung của Linux/Docker
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
      ]
    });

    const page = await browser.newPage();
    try {
      // TỐI ƯU: Tăng cường giả lập thông số người dùng thật
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      });

      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (['image', 'font', 'media', 'stylesheet'].includes(resourceType)) {
          req.abort();
        } else {
          req.continue();
        }
      });

      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
      await page.setViewport({ width: 1280, height: 800 });
      
      // TỐI ƯU: Tăng thời gian chờ đợi trang phản hồi tránh timeout giữa chừng khi mạng lag
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForSelector('#content, #content_chap, .page-chapter', { timeout: 5000 }).catch(() => {});

      const html = await page.content();
      return html;
    } catch (err) {
      throw err;
    } finally {
      // ĐẢM BẢO: Luôn đóng Tab sau khi lấy xong dữ liệu để giải phóng RAM lập tức
      await page.close().catch(() => {});
      if (!isShared) {
        await browser.close().catch(() => {});
      }
    }
  }

  private cleanUrlAndGetDomain(url: string): { cleanUrl: string; domain: string } {
    try {
      const parsedUrl = new URL(url.trim());
      const domain = `${parsedUrl.protocol}//${parsedUrl.hostname}/`;
      return { cleanUrl: url.trim(), domain };
    } catch {
      return { cleanUrl: url.trim(), domain: 'https://blogtruyenmoi.net/' };
    }
  }

  async crawlSingleChapterFromBlogTruyen(
    urlChapter: string, 
    truyenId: number, 
    soChuong?: number, 
    tenChuong?: string,
    sharedBrowser?: any
  ) {
    try {
      const { cleanUrl, domain } = this.cleanUrlAndGetDomain(urlChapter);

      let finalSoChuong = soChuong;
      if (finalSoChuong === undefined || finalSoChuong === null || isNaN(finalSoChuong)) {
        const match = cleanUrl.match(/(?:chuong|chapter)-([0-9]+(?:\.[0-9]+)?)/i);
        if (match) {
          finalSoChuong = Number(match[1]);
        } else {
          throw new BadRequestException('Không thể tự động nhận diện số chương từ URL link dán vào. Vui lòng nhập số chương!');
        }
      }

      let html = '';
      try {
        const bypassAgent = this.createBypassAgent();
        const res = await axios.get(cleanUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Referer': domain,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          },
          httpsAgent: bypassAgent,
          timeout: 6000 
        });
        html = res.data;
      } catch (axiosError) {
        console.log(`[Bypass] Axios bị chặn, đang kích hoạt Trình duyệt ngầm cho: ${cleanUrl}`);
        html = await this.getHtmlBypassCloudflare(cleanUrl, sharedBrowser);
      }

      const $ = cheerio.load(html);
      const imageLinks: string[] = [];
      const proxyPrefix = `${domain}v1/qq/images?src=`;

      $('#content img, .page-chapter img, #content_chap img, div[id*="content"] img, .content-page img, #vjs-image-player img').each((index, element) => {
        let imgUrl = $(element).attr('data-src') || $(element).attr('src') || $(element).attr('data-original');
        
        if (imgUrl && typeof imgUrl === 'string') {
          imgUrl = imgUrl.trim();
          if (!imgUrl.includes('banner') && !imgUrl.includes('logo') && !imgUrl.includes('avatar') && !imgUrl.includes('icon')) {
            if (imgUrl.includes('?src=')) {
              const parts = imgUrl.split('?src=');
              if (parts[1]) imgUrl = parts[1].trim();
            } else if (imgUrl.includes('&src=')) {
              const parts = imgUrl.split('&src=');
              if (parts[1]) imgUrl = parts[1].trim();
            }

            if (imgUrl && imgUrl.startsWith('http')) {
              imageLinks.push(imgUrl.includes('blogtruyen') ? imgUrl : `${proxyPrefix}${imgUrl}`);
            }
          }
        }
      });

      if (imageLinks.length === 0) {
        $('script').each((i, el) => {
          const scriptContent = $(el).html() || '';
          if (scriptContent.includes('listImage') || scriptContent.includes('arrImages') || scriptContent.includes('listImages')) {
            const regex = /(https?:\/\/[^\s'"]+\.(?:jpg|jpeg|png|webp|gif))/gi;
            let match;
            while ((match = regex.exec(scriptContent)) !== null) {
              const urlMatched = match[0];
              if (!urlMatched.includes('logo') && !urlMatched.includes('banner') && !imageLinks.includes(urlMatched)) {
                imageLinks.push(urlMatched);
              }
            }
          }
        });
      }

      if (imageLinks.length === 0) {
        throw new Error('Không bóc tách được mảng ảnh của chương. Giao diện trang nguồn thay đổi hoặc chương rỗng!');
      }

      const noiDungAnh = imageLinks.join(','); 

      const payload = {
        soChuong: finalSoChuong,
        tenChuong: tenChuong && tenChuong.trim() !== "" ? tenChuong.trim() : `Chương ${finalSoChuong}`, 
        noiDung: noiDungAnh,
        truyenId: Number(truyenId)
      };

      return await this.chuongService.createChuong(payload);
    } catch (error: any) {
      throw new BadRequestException(error?.message || 'Lỗi hệ thống khi bóc tách chương truyện.');
    }
  }

  async crawlAllChaptersFromStory(urlStory: string, truyenId: number) {
    const globalBrowser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const { cleanUrl, domain } = this.cleanUrlAndGetDomain(urlStory);
      const currentComic = await this.truyenService.getComicById(Number(truyenId)).catch(() => null);
      
      const existingChaptersList = currentComic && (currentComic as any).chuongs
        ? (currentComic as any).chuongs.map((c: any) => c.soChuong)
        : [];

      let html = '';
      try {
        const bypassAgent = this.createBypassAgent();
        const res = await axios.get(cleanUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Referer': domain,
          },
          httpsAgent: bypassAgent,
          timeout: 15000
        });
        html = res.data;
      } catch {
        html = await this.getHtmlBypassCloudflare(cleanUrl, globalBrowser);
      }

      const $ = cheerio.load(html);
      const chaptersList: ChapterItem[] = [];

      $('.works-chapter-item .name-chap a').each((index, element) => {
        let href = $(element).attr('href') || '';
        const text = $(element).text().trim();

        if (href) {
          href = href.trim();
          const fullUrl = href.startsWith('http') ? href : `${domain.replace(/\/$/, '')}${href.startsWith('/') ? '' : '/'}${href}`;
          const match = fullUrl.match(/(?:chuong|chapter)-([0-9]+(?:\.[0-9]+)?)/i);
          const soChuong = match ? Number(match[1]) : null;

          if (soChuong !== null && !isNaN(soChuong)) {
            chaptersList.push({ url: fullUrl, soChuong, tenChuong: text });
          }
        }
      });

      if (chaptersList.length === 0) {
        throw new BadRequestException('Không tìm thấy danh sách chương nào từ đường link này.');
      }

      let chaptersToCrawl = chaptersList.filter(c => !existingChaptersList.includes(c.soChuong));

      if (existingChaptersList.length > 0) {
        const maxExistingChapter = Math.max(...existingChaptersList);
        chaptersToCrawl = chaptersToCrawl.filter(c => c.soChuong >= (maxExistingChapter - 1));
      }

      if (chaptersToCrawl.length === 0) {
        return {
          message: 'Hệ thống nhận diện bộ truyện này đã được cập nhật đầy đủ các chương mới nhất từ nguồn!',
          totalChaptersFound: chaptersList.length,
          successCount: 0,
          failCount: 0
        };
      }

      chaptersToCrawl.sort((a, b) => a.soChuong - b.soChuong);
      let successCount = 0;
      let failCount = 0;

      for (const chapter of chaptersToCrawl) {
        try {
          await this.crawlSingleChapterFromBlogTruyen(chapter.url, Number(truyenId), chapter.soChuong, chapter.tenChuong, globalBrowser);
          successCount++;
          // TỐI ƯU: Tăng thời gian nghỉ giữa các tập lên 1.5s tránh bị block IP khi bóc tách ảnh
          await new Promise(resolve => setTimeout(resolve, 1500)); 
        } catch (err: any) {
          console.error(`Lỗi bỏ qua chương ${chapter.soChuong} của truyện ID ${truyenId}: ${err.message}`);
          failCount++;
          continue; 
        }
      }

      return {
        message: `Quá trình cào hoàn tất! Thêm thành công ${successCount} chương mới.`,
        totalChaptersFound: chaptersList.length,
        successCount,
        failCount
      };
    } catch (error: any) {
      throw new BadRequestException(error?.message || 'Lỗi hệ thống khi quét danh sách chương.');
    } finally {
      await globalBrowser.close().catch(() => {});
    }
  }

  async crawlMultiStoriesFromPage(urlPage: string) {
    const globalBrowser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const { cleanUrl, domain } = this.cleanUrlAndGetDomain(urlPage);
      
      let html = '';
      try {
        const bypassAgent = this.createBypassAgent();
        const res = await axios.get(cleanUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Referer': domain,
          },
          httpsAgent: bypassAgent,
          timeout: 15000
        });
        html = res.data;
      } catch {
        html = await this.getHtmlBypassCloudflare(cleanUrl, globalBrowser);
      }

      const $ = cheerio.load(html);
      const storiesList: { tenTruyen: string; urlAnhBia: string; urlTruyenGoc: string }[] = [];

      $('.book_info').each((index, element) => {
        const parent = $(element).prev('.book_avatar');
        const tenTruyen = $(element).find('.book_name h3 a').text().trim();
        let hrefTruyen = $(element).find('.book_name h3 a').attr('href') || '';
        let urlAnhBia = parent.find('img').attr('data-src') || parent.find('img').attr('src') || parent.find('img').attr('data-original') || '';

        if (tenTruyen && hrefTruyen) {
          const urlTruyenGoc = hrefTruyen.startsWith('http') ? hrefTruyen.trim() : `${domain.replace(/\/$/, '')}${hrefTruyen.startsWith('/') ? '' : '/'}${hrefTruyen.trim()}`;
          if (urlAnhBia && !urlAnhBia.startsWith('http')) {
            urlAnhBia = `${domain.replace(/\/$/, '')}${urlAnhBia.startsWith('/') ? '' : '/'}${urlAnhBia.trim()}`;
          }
          storiesList.push({ tenTruyen, urlAnhBia: urlAnhBia.trim(), urlTruyenGoc });
        }
      });

      if (storiesList.length === 0) {
        throw new BadRequestException('Không tìm thấy danh sách truyện nào từ trang này. Kiểm tra lại Selector CSS!');
      }

      let successStories = 0; 
      let updatedStories = 0; 
      const allComicsInDb = await this.truyenService.getAllComics().catch(() => []);

      for (const story of storiesList) {
        try {
          const slug = this.generateSlug(story.tenTruyen);
          const tenKhongDau = this.removeVietnameseTones(story.tenTruyen);
          const dbMatch = allComicsInDb.find((t: any) => t.slug === slug);
          
          let currentTruyenId: number;
          let targetStoryDetail: any = null;
          let isNewStory = false;

          let htmlStory = '';
          try {
            const bypassAgent = this.createBypassAgent();
            const resStory = await axios.get(story.urlTruyenGoc, {
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
              httpsAgent: bypassAgent,
              timeout: 15000
            });
            htmlStory = resStory.data;
          } catch {
            htmlStory = await this.getHtmlBypassCloudflare(story.urlTruyenGoc, globalBrowser);
          }
          
          const $story = cheerio.load(htmlStory);

          let extractedMoTa = $story('.detail .content .detail-content').text().trim() 
            || $story('.detail .content').find('p, span').text().trim();
          if (!extractedMoTa) {
            extractedMoTa = "Truyện tự động cập nhật hệ thống";
          } else {
            extractedMoTa = extractedMoTa
              .replace(/blogtruyenmoi\.net/gi, 'patrick-comic.vercel.app')
              .replace(/blogtruyenmoi/gi, 'PATRICK COMIC')
              .replace(/blogtruyen/gi, 'PATRICK COMIC');
          }

          let extractedTacGia = "Đang cập nhật";
          const extractedTheLoais: string[] = [];

          $story('.description p, .description span, .description li').each((_, el) => {
            const text = $story(el).text();
            if (text.includes('Tác giả:')) {
              const authorLink = $story(el).find('a').text().trim();
              extractedTacGia = authorLink || text.replace('Tác giả:', '').trim();
            }
          });

          const genreBlacklist = ['thích', 'theo dõi', 'đọc từ đầu', 'đọc tiếp', 'bình luận', 'share', 'like'];

          $story('li.li03 a, .description a[href*="/the-loai/"]').each((_, el) => {
            const genreName = $story(el).text().trim();
            if (genreName && !genreBlacklist.includes(genreName.toLowerCase())) {
              if (!extractedTheLoais.includes(genreName)) {
                extractedTheLoais.push(genreName);
              }
            }
          });

          if (extractedTheLoais.length === 0) {
            $story('.description p a[href*="/the-loai/"], .description a[href*="/category/"]').each((_, el) => {
              const genreName = $story(el).text().trim();
              if (genreName && !genreBlacklist.includes(genreName.toLowerCase())) {
                if (!extractedTheLoais.includes(genreName)) {
                  extractedTheLoais.push(genreName);
                }
              }
            });
          }

          if (!dbMatch) {
            const newStory = await this.truyenService.createComic({
              tenTruyen: story.tenTruyen,
              tenKhongDau: tenKhongDau,
              slug: slug,
              thumbnail: story.urlAnhBia, 
              trangThai: 'Đang ra',
              moTa: extractedMoTa,
              tacGia: extractedTacGia,
              theLoaiNames: extractedTheLoais 
            });
            currentTruyenId = Number(newStory.id);
            isNewStory = true;
            console.log(`[Hệ thống] Tạo truyện mới thành công: ${story.tenTruyen}`);
          } else {
            currentTruyenId = Number(dbMatch.id);
            targetStoryDetail = await this.truyenService.getComicById(currentTruyenId).catch(() => null);
            console.log(`[Hệ thống] Truyện [${story.tenTruyen}] đã tồn tại trong DB. Đang phân tích chương...`);
          }

          const chaptersList: ChapterItem[] = [];
          $story('.works-chapter-item .name-chap a').each((_, element) => {
            let href = $story(element).attr('href') || '';
            const text = $story(element).text().trim();
            if (href) {
              const fullUrl = href.startsWith('http') ? href.trim() : `${domain.replace(/\/$/, '')}${href.startsWith('/') ? '' : '/'}${href}`;
              const match = fullUrl.match(/(?:chuong|chapter)-([0-9]+(?:\.[0-9]+)?)/i);
              const soChuong = match ? Number(match[1]) : null;

              if (soChuong !== null && !isNaN(soChuong)) {
                chaptersList.push({ url: fullUrl, soChuong, tenChuong: text });
              }
            }
          });

          let chaptersToCrawl: ChapterItem[] = [];
          if (isNewStory) {
            chaptersToCrawl = chaptersList;
          } else {
            const existingSoChuongList = targetStoryDetail && (targetStoryDetail as any).chuongs
              ? (targetStoryDetail as any).chuongs.map((c: any) => c.soChuong) 
              : [];
            
            chaptersToCrawl = chaptersList.filter(c => !existingSoChuongList.includes(c.soChuong));

            if (existingSoChuongList.length > 0) {
              const maxExistingChapter = Math.max(...existingSoChuongList);
              chaptersToCrawl = chaptersToCrawl.filter(c => c.soChuong >= (maxExistingChapter - 1));
            }
          }

          chaptersToCrawl.sort((a, b) => a.soChuong - b.soChuong);

          if (chaptersToCrawl.length === 0) {
            console.log(`[Hệ thống] Truyện [${story.tenTruyen}] đã đầy đủ chương & không có thay đổi. Bỏ qua để giữ nguyên vị trí.`);
            continue; 
          }

          console.log(`[Hệ thống] Đang tiến hành cào ${chaptersToCrawl.length} chương mới cho truyện [${story.tenTruyen}]...`);
          
          let localSuccessCount = 0; 

          for (const chapter of chaptersToCrawl) {
            try {
              await this.crawlSingleChapterFromBlogTruyen(chapter.url, Number(currentTruyenId), chapter.soChuong, chapter.tenChuong, globalBrowser);
              localSuccessCount++;
              // TỐI ƯU: Cho bot nghỉ từ 1 đến 2.5 giây ngẫu nhiên giữa các chương để giả lập hành vi người thật
              const delayRandom = Math.floor(Math.random() * (2500 - 1000 + 1)) + 1000;
              await new Promise(resolve => setTimeout(resolve, delayRandom)); 
            } catch (err: any) {
              console.error(`Lỗi bỏ qua chương ${chapter.soChuong} của truyện ${story.tenTruyen}: ${err.message}`);
            }
          }

          if (!isNewStory) {
            if (localSuccessCount > 0) {
              await this.truyenService.updateComic(currentTruyenId, {
                moTa: extractedMoTa,
                tacGia: extractedTacGia,
                theLoaiNames: extractedTheLoais
              }).catch(() => {});
              updatedStories++;
            } else {
              console.log(`[Hệ thống] Truyện [${story.tenTruyen}] có chương mới nhưng cào lỗi hoàn toàn. Giữ nguyên vị trí cũ.`);
            }
          } else {
            if (localSuccessCount > 0) {
              successStories++;
            }
          }

          // TỐI ƯU: Tăng thời gian chuyển tiếp giữa các bộ truyện lên 3.5 giây để IP hồi phục
          await new Promise(resolve => setTimeout(resolve, 3500)); 

        } catch (storyError: any) {
          console.error(`Lỗi nghiêm trọng khi xử lý truyện lẻ [${story.tenTruyen}]:`, storyError.message);
          continue; 
        }
      }

      return {
        message: `Tiến trình cào hoàn tất! Thêm mới thành công ${successStories} truyện. Cập nhật thêm chương mới thành công cho ${updatedStories} truyện cũ.`,
        totalFound: storiesList.length,
        successStories,
        updatedStories
      };

    } catch (error: any) {
      throw new BadRequestException(error?.message || 'Lỗi hệ thống khi cào hàng loạt truyện.');
    } finally {
      await globalBrowser.close().catch(() => {});
    }
  }

  private removeVietnameseTones(str: string): string {
    if (!str) return "";
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd') 
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');
  }

  private generateSlug(str: string): string {
    return this.removeVietnameseTones(str)
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  async autoCrawlNextChapter(slug: string, truyenId: number, soChuongMoi: number) {
    const targetUrl = `https://blogtruyenmoi.net/${slug}/chuong-${soChuongMoi}`;
    return this.crawlSingleChapterFromBlogTruyen(targetUrl, Number(truyenId), soChuongMoi);
  }
}