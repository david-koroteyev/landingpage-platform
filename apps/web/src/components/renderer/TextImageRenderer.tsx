import type { TextImageBlock } from '@lp/shared';

export function TextImageRenderer({ block }: { block: TextImageBlock }) {
  const { props } = block;
  const reversed = props.imagePosition === 'left';

  return (
    <div className="py-16 px-6 md:px-12" style={{ backgroundColor: block.styles.backgroundColor }}>
      <div className={`mx-auto max-w-5xl flex flex-col md:flex-row gap-12 items-center ${reversed ? 'md:flex-row-reverse' : ''}`}>
        <div className="flex-1">
          {props.heading && <h2 className="text-3xl font-bold text-gray-900 mb-4">{props.heading}</h2>}
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">{props.body}</p>
          {props.ctaLabel && (
            <a href={props.ctaHref || '#'} className="btn-primary mt-6 inline-flex">
              {props.ctaLabel}
            </a>
          )}
        </div>
        {props.imageUrl && (
          <div className="flex-1">
            <img
              src={props.imageUrl}
              alt={props.imageAlt || ''}
              className="rounded-xl shadow-md w-full object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
}
