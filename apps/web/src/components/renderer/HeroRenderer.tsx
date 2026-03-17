import type { HeroBlock } from '@lp/shared';

export function HeroRenderer({ block }: { block: HeroBlock }) {
  const { props, styles } = block;
  const alignClass = props.alignment === 'left' ? 'text-left items-start' : props.alignment === 'right' ? 'text-right items-end' : 'text-center items-center';

  return (
    <div
      className="relative py-20 px-6 md:px-12"
      style={{
        backgroundColor: styles.backgroundColor,
        color: styles.textColor,
        minHeight: props.minHeight,
        backgroundImage: props.backgroundImage ? `url(${props.backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {props.backgroundImage && props.backgroundOverlay && (
        <div className="absolute inset-0 bg-black/50" />
      )}
      <div className={`relative mx-auto max-w-3xl flex flex-col gap-6 ${alignClass}`}>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900"
          style={{ color: props.backgroundImage && props.backgroundOverlay ? '#fff' : undefined }}>
          {props.headline}
        </h1>
        {props.subheadline && (
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl"
            style={{ color: props.backgroundImage && props.backgroundOverlay ? 'rgba(255,255,255,0.85)' : undefined }}>
            {props.subheadline}
          </p>
        )}
        {(props.ctaLabel || props.secondaryCtaLabel) && (
          <div className="flex flex-wrap gap-3">
            {props.ctaLabel && (
              <a
                href={props.ctaHref || '#'}
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow hover:bg-blue-700 transition-colors"
              >
                {props.ctaLabel}
              </a>
            )}
            {props.secondaryCtaLabel && (
              <a
                href={props.secondaryCtaHref || '#'}
                className="inline-flex items-center justify-center rounded-lg border-2 border-gray-300 px-6 py-3 text-base font-semibold text-gray-700 hover:border-gray-400 transition-colors"
              >
                {props.secondaryCtaLabel}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
