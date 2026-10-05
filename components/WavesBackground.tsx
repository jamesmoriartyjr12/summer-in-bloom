type WavesBackgroundProps = {
  overlayClassName?: string;
};

export function WavesBackground({ overlayClassName = "bg-black/35" }: WavesBackgroundProps) {
  return (
    <div className="absolute inset-0 z-0" aria-hidden>
      <video
        src="/waves-video.webm"
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-full object-cover"
      />
      <div className={`absolute inset-0 ${overlayClassName}`} />
    </div>
  );
}
