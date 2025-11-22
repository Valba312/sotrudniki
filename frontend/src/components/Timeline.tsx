interface TimelineItem {
  title: string;
  subtitle?: string;
  date: string;
}

export const Timeline = ({ items }: { items: TimelineItem[] }) => (
  <ul className="timeline">
    {items.map((item, idx) => (
      <li key={idx} className="timeline__item">
        <div className="timeline__dot" />
        <div>
          <div className="timeline__title">{item.title}</div>
          {item.subtitle && <div className="muted">{item.subtitle}</div>}
          <div className="muted">{item.date}</div>
        </div>
      </li>
    ))}
  </ul>
);
