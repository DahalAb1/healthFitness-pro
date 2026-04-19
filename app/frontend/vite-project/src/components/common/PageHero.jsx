import '../../styles/components/common/page-hero.css';

/**
 * PageHero – shared hero section for all feature pages.
 *
 * Props:
 *  title     – main h1 heading (required)
 *  description – subtitle paragraph (optional)
 *  className – extra class(es) for page-specific overrides, e.g. "el-hero"
 *  children  – any additional content rendered below the description
 */
function PageHero({ title, description, className = '', children }) {
  return (
    <section className={`page-hero${className ? ` ${className}` : ''}`}>
      <div className="page-hero-content">
        <h1>{title}</h1>
        {description && <p className="page-hero-description">{description}</p>}
        {children}
      </div>
    </section>
  );
}

export default PageHero;
