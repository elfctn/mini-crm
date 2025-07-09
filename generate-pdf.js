const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const MarkdownIt = require('markdown-it');

// markdown-it konfigürasyonu
const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true
});

async function generatePDF() {
  try {
    // markdown dosyasını oku
    const markdownContent = fs.readFileSync('PROJE_OZETI.md', 'utf8');
    
    // markdown'ı HTML'e çevir
    const htmlContent = md.render(markdownContent);
    
    // HTML template oluştur
    const fullHTML = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mini CRM Projesi - Geliştirme Süreci</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
          }
          
          h1 {
            color: #2563eb;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 10px;
            margin-top: 30px;
          }
          
          h2 {
            color: #1e40af;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 5px;
            margin-top: 25px;
          }
          
          h3 {
            color: #1e3a8a;
            margin-top: 20px;
          }
          
          code {
            background-color: #f3f4f6;
            padding: 2px 4px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
          }
          
          pre {
            background-color: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            overflow-x: auto;
            border: 1px solid #e2e8f0;
          }
          
          pre code {
            background: none;
            padding: 0;
          }
          
          blockquote {
            border-left: 4px solid #3b82f6;
            margin: 20px 0;
            padding: 10px 20px;
            background-color: #f8fafc;
            font-style: italic;
          }
          
          table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
          }
          
          th, td {
            border: 1px solid #d1d5db;
            padding: 12px;
            text-align: left;
          }
          
          th {
            background-color: #f3f4f6;
            font-weight: bold;
          }
          
          ul, ol {
            margin: 15px 0;
            padding-left: 30px;
          }
          
          li {
            margin: 8px 0;
          }
          
          .emoji {
            font-size: 1.2em;
          }
          
          .checkmark {
            color: #10b981;
            font-weight: bold;
          }
          
          .highlight {
            background-color: #fef3c7;
            padding: 2px 4px;
            border-radius: 4px;
          }
          
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 0.9em;
          }
          
          @media print {
            body {
              margin: 0;
              padding: 15px;
            }
            
            h1, h2, h3 {
              page-break-after: avoid;
            }
            
            pre, blockquote {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        ${htmlContent}
        <div class="footer">
          <p>Bu dokümantasyon Mini CRM projesi için hazırlanmıştır.</p>
          <p>Geliştirici: Elif Çetin | Tarih: ${new Date().toLocaleDateString('tr-TR')}</p>
        </div>
      </body>
      </html>
    `;
    
    // Geçici HTML dosyası oluştur
    fs.writeFileSync('temp.html', fullHTML);
    
    // Puppeteer ile PDF oluştur
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(fullHTML, { waitUntil: 'networkidle0' });
    
    // PDF ayarları
    await page.pdf({
      path: 'Mini_CRM_Proje_Ozeti.pdf',
      format: 'A4',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      printBackground: true,
      displayHeaderFooter: false
    });
    
    await browser.close();
    
    // Geçici dosyayı sil
    fs.unlinkSync('temp.html');
    
    console.log('✅ PDF başarıyla oluşturuldu: Mini_CRM_Proje_Ozeti.pdf');
    
  } catch (error) {
    console.error('❌ PDF oluşturulurken hata:', error);
  }
}

// Gerekli paketleri kontrol et ve yükle
async function checkAndInstallDependencies() {
  const requiredPackages = ['puppeteer', 'markdown-it'];
  
  for (const pkg of requiredPackages) {
    try {
      require.resolve(pkg);
      console.log(`✅ ${pkg} zaten yüklü`);
    } catch (e) {
      console.log(`📦 ${pkg} yükleniyor...`);
      const { execSync } = require('child_process');
      execSync(`npm install ${pkg}`, { stdio: 'inherit' });
    }
  }
}

// Ana fonksiyonu çalıştır
async function main() {
  console.log('🚀 PDF oluşturma işlemi başlatılıyor...');
  
  // Bağımlılıkları kontrol et
  await checkAndInstallDependencies();
  
  // PDF oluştur
  await generatePDF();
}

main().catch(console.error); 