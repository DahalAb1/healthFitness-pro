import '../../styles/components/common/page-hero.css';

function PageHero({ title, description, className }) {
  return (
    <section className={['page-hero', className].filter(Boolean).join(' ')}>
      <div className="page-hero-content">
        <h1>{title}</h1>
        {description && <p className="page-hero-description">{description}</p>}
      </div>
    </section>
  );
}

export default PageHero;
