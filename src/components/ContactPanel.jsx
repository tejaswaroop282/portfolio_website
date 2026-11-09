import { profile } from '../data/profile'
import { IconGithub, IconLinkedin, IconMail, IconDownload, IconCode } from './Icons'

/** Contact links. All values come from data/profile.js (LinkedIn/GitHub/LeetCode URLs were taken from the resume PDF). */
export default function ContactPanel({ compact = false }) {
  const { links } = profile
  return (
    <div className={compact ? 'contact contact-compact' : 'contact'}>
      <p className="display contact-quote">Every journey begins with a conversation.</p>
      <div className="link-row">
        <a className="btn-gold" href={`mailto:${links.email}`}>
          <IconMail /> Email me
        </a>
        <a className="btn-ghost" href={links.linkedin} target="_blank" rel="noreferrer noopener">
          <IconLinkedin /> LinkedIn
        </a>
        <a className="btn-ghost" href={links.github} target="_blank" rel="noreferrer noopener">
          <IconGithub /> GitHub
        </a>
        <a className="btn-ghost" href={links.resume} download>
          <IconDownload /> Resume
        </a>
      </div>
      <p className="contact-line">
        <a href={`mailto:${links.email}`}>{links.email}</a>
        <span aria-hidden="true"> · </span>
        <a href={`tel:${links.phone.replace(/\s/g, '')}`}>{links.phone}</a>
        <span aria-hidden="true"> · </span>
        <a href={links.leetcode} target="_blank" rel="noreferrer noopener">
          <IconCode width={13} height={13} style={{ display: 'inline', verticalAlign: '-2px' }} /> LeetCode
        </a>
      </p>
    </div>
  )
}
