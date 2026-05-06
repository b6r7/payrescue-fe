/**
 * Transition overlay between PaymentInitiated → PaymentConfirmed.
 * Plays paid.mp4 at 400×400 px. Min 4 s / max 8 s on screen.
 */
import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import styles from './PaymentTransition.module.css'

const MIN_MS = 4000
const MAX_MS = 8000

type Props = {
  onComplete: () => void
}

export const PaymentTransition = ({ onComplete }: Props) => {
  const calledRef     = useRef(false)
  const minFiredRef   = useRef(false)
  const videoReadyRef = useRef(false)

  const tryComplete = () => {
    if (calledRef.current) return
    if (minFiredRef.current && videoReadyRef.current) {
      calledRef.current = true
      onComplete()
    }
  }

  useEffect(() => {
    const minTimer = setTimeout(() => {
      minFiredRef.current = true
      tryComplete()
    }, MIN_MS)

    const maxTimer = setTimeout(() => {
      if (calledRef.current) return
      calledRef.current = true
      onComplete()
    }, MAX_MS)

    return () => {
      clearTimeout(minTimer)
      clearTimeout(maxTimer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleVideoEnded = () => {
    videoReadyRef.current = true
    tryComplete()
  }

  const handleVideoError = () => {
    videoReadyRef.current = true
    tryComplete()
  }

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <video
        className={styles.video}
        src="./paid.mp4"
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnded}
        onError={handleVideoError}
        aria-hidden="true"
      />
    </motion.div>
  )
}
