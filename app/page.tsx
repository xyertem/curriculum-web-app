import { Suspense } from 'react'
import Link from 'next/link'
import { connection } from 'next/server'
import { db } from '@/app/lib/db'

async function PublishedContent() {
  // Read at request time inside Suspense with Cache Components enabled.
  await connection()
  const [courses, articles] = await Promise.all([
    db.course.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ position: 'asc' }, { id: 'asc' }],
      take: 12,
      select: {
        id: true, title: true, description: true,
        category: { select: { name: true } },
        lessons: {
          where: { status: 'PUBLISHED' },
          orderBy: [{ position: 'asc' }, { id: 'asc' }],
          select: { id: true, title: true, description: true },
        },
      },
    }),
    db.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ position: 'asc' }, { id: 'asc' }],
      take: 12,
      select: {
        id: true, title: true, description: true,
        category: { select: { name: true } },
      },
    }),
  ])

  return (
    <div className="space-y-12">
      <section aria-labelledby="courses-heading">
        <h2 id="courses-heading" className="mb-5 text-2xl font-semibold">Eğitimler</h2>
        {courses.length === 0 ? <p>Henüz yayınlanmış eğitim bulunmuyor.</p> : (
          <div className="grid gap-6 md:grid-cols-2">
            {courses.map((course) => (
              <article key={course.id} className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
                {course.category && <p className="mb-2 text-sm text-blue-600 dark:text-blue-400">{course.category.name}</p>}
                <h3 className="text-xl font-semibold">{course.title}</h3>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">{course.description}</p>
                <h4 className="mt-6 font-medium">Dersler</h4>
                {course.lessons.length === 0 ? <p className="mt-2 text-sm">Henüz yayınlanmış ders bulunmuyor.</p> : (
                  <ol className="mt-3 list-decimal space-y-3 pl-5">
                    {course.lessons.map((lesson) => (
                      <li key={lesson.id}>
                        <p className="font-medium">{lesson.title}</p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">{lesson.description}</p>
                      </li>
                    ))}
                  </ol>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
      <section aria-labelledby="articles-heading">
        <h2 id="articles-heading" className="mb-5 text-2xl font-semibold">Makaleler</h2>
        {articles.length === 0 ? <p>Henüz yayınlanmış makale bulunmuyor.</p> : (
          <div className="grid gap-6 md:grid-cols-2">
            {articles.map((article) => (
              <article key={article.id} className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
                {article.category && <p className="mb-2 text-sm text-blue-600 dark:text-blue-400">{article.category.name}</p>}
                <h3 className="text-xl font-semibold">{article.title}</h3>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">{article.description}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <header className="mb-12">
        <nav aria-label="Hesap" className="mb-8 flex gap-5 text-sm underline">
          <Link href="/login">Giriş yap</Link>
          <Link href="/signup">Kayıt ol</Link>
          <Link href="/profile">Hesabım</Link>
        </nav>
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-blue-600 dark:text-blue-400">Öğrenmeye başla</p>
        <h1 className="text-4xl font-bold tracking-tight">Eğitimler ve makaleler</h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">Yeni beceriler edinmek için eğitimleri ve yazıları keşfet.</p>
      </header>
      <Suspense fallback={<p role="status">İçerikler yükleniyor…</p>}>
        <PublishedContent />
      </Suspense>
    </main>
  )
}
