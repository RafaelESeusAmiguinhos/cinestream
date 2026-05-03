import { useEffect, useRef } from 'react'
import Hls from 'hls.js'

export default function VideoPlayer({ src, poster, subtitles = [] }) {
  const videoRef = useRef(null)
  const hlsRef = useRef(null)

  useEffect(() => {
    if (!src || !videoRef.current) return

    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null }

    const video = videoRef.current

    if (Hls.isSupported() && (src.includes('.m3u8') || src.includes('m3u'))) {
      const hls = new Hls({ enableWorker: false, xhrSetup: (xhr) => { xhr.withCredentials = false } })
      hlsRef.current = hls
      hls.loadSource(src)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}))
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) hls.destroy()
      })
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src
      video.play().catch(() => {})
    } else {
      video.src = src
      video.play().catch(() => {})
    }

    return () => {
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null }
    }
  }, [src])

  return (
    <video
      ref={videoRef}
      controls
      poster={poster}
      className="w-full aspect-video bg-black"
      playsInline
      crossOrigin="anonymous"
    >
      {subtitles.map((sub, i) => (
        <track
          key={i}
          kind="subtitles"
          src={sub.url}
          srcLang={sub.lang?.slice(0, 2).toLowerCase() || 'en'}
          label={sub.lang || 'Legenda'}
          default={i === 0}
        />
      ))}
    </video>
  )
}
