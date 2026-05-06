import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import styles from './FlowCard.module.css'

type Props = {
  children: ReactNode
  /** Content rendered below the card but still inside the centered shell */
  footer?: ReactNode
  className?: string
  /** When provided, renders a back-arrow button in place of the Affirm logo */
  onBack?: () => void
}

export const FlowCard = ({ children, footer, className, onBack }: Props) => (
  <main className={styles.shell}>
    <motion.div
      className={[styles.card, className].filter(Boolean).join(' ')}
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
    >
      <motion.div
        className={styles.logo}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        {onBack ? (
          <button
            type="button"
            className={styles.backBtn}
            onClick={onBack}
            aria-label="Go back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#0c0c14" fillRule="evenodd" d="M10.53 4.47a.75.75 0 0 1 0 1.06l-5.72 5.72H21a.75.75 0 0 1 0 1.5H4.81l5.72 5.72a.75.75 0 0 1-1.06 1.06l-7-7a.75.75 0 0 1 0-1.06l7-7a.75.75 0 0 1 1.06 0" clipRule="evenodd"/>
            </svg>
          </button>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="78" height="39" fill="none" aria-label="Affirm" role="img">
            <path fill="#121319" d="M32.998 21.488h-2.84V20.39c0-1.44.833-1.856 1.552-1.856.796 0 1.401.341 1.401.341l.947-2.196s-.984-.644-2.764-.644c-2.007 0-4.279 1.136-4.279 4.657v.796H22.32V20.39c0-1.44.833-1.856 1.553-1.856.416 0 .946.076 1.4.341l.947-2.196c-.568-.34-1.514-.644-2.764-.644-2.007 0-4.279 1.136-4.279 4.657v.796H17.36v2.423h1.817v8.481h3.105v-8.481h4.771v8.481h3.105v-8.481h2.84zM40.571 21.488v10.904h3.105V27.13c0-2.499 1.515-3.218 2.575-3.218.416 0 .984.113 1.325.378l.568-2.877a4 4 0 0 0-1.401-.265c-1.59 0-2.613.72-3.294 2.158v-1.817z"/>
            <path fill="#121319" fillRule="evenodd" d="M11.302 21.185c-1.78 0-3.862.833-4.998 1.741l1.022 2.159c.909-.833 2.348-1.515 3.673-1.515 1.25 0 1.931.417 1.931 1.25 0 .568-.454.833-1.325.946-3.219.417-5.755 1.288-5.755 3.787 0 1.969 1.4 3.18 3.597 3.18 1.552 0 2.953-.87 3.635-2.007v1.666h2.915v-7.118c0-2.916-2.044-4.09-4.695-4.09m-1.098 9.239c-.833 0-1.212-.417-1.212-1.06 0-1.25 1.363-1.667 3.9-1.932 0 1.666-1.136 2.992-2.688 2.992" clipRule="evenodd"/>
            <path fill="#121319" d="M59.125 23.116c.643-.947 1.855-1.931 3.521-1.931 2.007 0 3.635 1.211 3.597 3.673v7.534h-3.105v-6.55c0-1.439-.87-2.045-1.704-2.045-1.022 0-2.044.947-2.044 2.992v5.603h-3.105V25.88c0-1.515-.795-2.083-1.704-2.083-.985 0-2.045.985-2.045 2.992v5.603h-3.105V21.488h2.992v1.666c.53-1.06 1.666-1.97 3.332-1.97 1.514 0 2.764.72 3.37 1.932M34.854 21.488h3.105v10.904h-3.105z"/>
            <path fill="#4a4af4" d="M53.028 6.266c-8.406 0-15.94 5.83-18.061 13.366h3.067c1.78-5.604 7.838-10.527 14.994-10.527 8.747 0 16.282 6.665 16.282 17.001 0 2.31-.303 4.43-.871 6.286h2.953l.038-.114c.492-1.893.72-3.976.72-6.172 0-11.51-8.407-19.84-19.122-19.84"/>
          </svg>
        )}
      </motion.div>
      {children}
    </motion.div>
    {footer && (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.25 }}
      >
        {footer}
      </motion.div>
    )}
  </main>
)
