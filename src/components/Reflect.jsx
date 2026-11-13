import { useT } from '../lib/i18n'

// Four questions to take away from any chapter, from the Discovery Bible Study
// method as Alex Absalom sets it out for Discipleship.org.
const QUESTIONS = [
  'What does this chapter show you about God?',
  'What does it show you about people?',
  'What will you do this week because of it?',
  'Who will you share it with?',
]

export default function Reflect() {
  const t = useT()
  return (
    <section className="reflect page-in" aria-labelledby="reflect-title">
      <h2 id="reflect-title" className="eyebrow">{t('To think about')}</h2>
      <ol>
        {QUESTIONS.map(q => <li key={q}>{t(q)}</li>)}
      </ol>
      <p className="reflect-source">
        {t('These questions follow the Discovery Bible Study, as set out in')}{' '}
        <a href="https://discipleship.org/?p=2571" target="_blank" rel="noreferrer">Alex Absalom, “How to Lead a Discovery Bible Study,” Discipleship.org</a>.
      </p>
    </section>
  )
}
