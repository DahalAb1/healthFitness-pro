function WorkoutCard({ title, subtitle, exerciseCount, actions, children }) {
  return (
    <article className="wt-template-card">
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
      <span>{exerciseCount} EXERCISES</span>
      <div className="wt-card-actions">{actions}</div>
      {children}
    </article>
  );
}

export default WorkoutCard;
