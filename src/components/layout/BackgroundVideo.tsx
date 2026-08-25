"use client";


export function BackgroundVideo() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none w-full h-full overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="w-full h-full object-cover"
      >
        <source src="/videos/bg-video.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/80" />
    </div>

  );
}
