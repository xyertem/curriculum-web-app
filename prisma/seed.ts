import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL is required.')
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })

async function main() {
  await db.$transaction(async (tx) => {
    // Empty updates preserve edits made after the first seed run.
    const category = await tx.category.upsert({
      where: { slug: 'ornek-web-gelistirme' },
      update: {},
      create: {
        name: 'Web Geliştirme', slug: 'ornek-web-gelistirme',
        description: 'Web uygulamaları geliştirmek için temel bilgiler.',
      },
    })
    const course = await tx.course.upsert({
      where: { slug: 'ornek-web-gelistirmeye-giris' },
      update: {},
      create: {
        title: 'Web Geliştirmeye Giriş', slug: 'ornek-web-gelistirmeye-giris',
        description: 'İstemci, sunucu ve veritabanının birlikte nasıl çalıştığını öğrenin.',
        categoryId: category.id, status: 'PUBLISHED', publishedAt: new Date(),
      },
    })
    for (const [position, title, slug, description] of [
      [1, 'Web nasıl çalışır?', 'web-nasil-calisir', 'Tarayıcıdan sunucuya bir isteğin yolculuğu.'],
      [2, 'Veritabanına giriş', 'veritabanina-giris', 'Tablolar, kayıtlar ve ilişkilerle tanışın.'],
    ] as const) {
      await tx.lesson.upsert({
        where: { courseId_slug: { courseId: course.id, slug } },
        update: {},
        create: {
          courseId: course.id, title, slug, description, position,
          status: 'PUBLISHED', publishedAt: new Date(),
          content: {
            type: 'doc',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: description }] }],
          },
        },
      })
    }
    await tx.article.upsert({
      where: { slug: 'ornek-istemci-ve-sunucu' },
      update: {},
      create: {
        title: 'İstemci ve sunucu nedir?', slug: 'ornek-istemci-ve-sunucu',
        description: 'Bir web uygulamasının iki temel parçasını tanıyın.',
        categoryId: category.id, status: 'PUBLISHED', publishedAt: new Date(),
        content: {
          type: 'doc',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'İstemci istek gönderir; sunucu isteği işler ve yanıt verir.' }] }],
        },
      },
    })
    await tx.article.upsert({
      where: { slug: 'ornek-taslak-makale' },
      update: {},
      create: {
        title: 'Örnek taslak makale', slug: 'ornek-taslak-makale',
        description: 'Bu içerik yayınlanmadığı için ana sayfada görünmez.',
        categoryId: category.id,
      },
    })
  })
  console.log('Örnek içerikler hazır: 1 kategori, 1 kurs, 2 ders, 1 yayınlanmış ve 1 taslak makale.')
}

main()
  .catch(() => {
    console.error('Seed tamamlanamadı. DATABASE_URL, veritabanı bağlantısı ve migration durumunu kontrol edin.')
    process.exitCode = 1
  })
  .finally(async () => { await db.$disconnect() })
