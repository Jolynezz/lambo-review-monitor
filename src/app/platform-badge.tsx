const META: Record<string, { name: string; logo: string }> = {
  ctrip: { name: '携程', logo: '/platforms/ctrip.png' },
  fliggy: { name: '飞猪', logo: '/platforms/fliggy.png' },
  qunar: { name: '去哪儿', logo: '/platforms/qunar.png' },
};

export default function PlatformBadge({ platform }: { platform: string }) {
  const m = META[platform];
  if (!m) {
    return <span className="platform"><span className="platform-name">{platform}</span></span>;
  }
  return (
    <span className="platform">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={m.logo} alt={m.name} className="platform-logo" width={22} height={22} />
      <span className="platform-name">{m.name}</span>
    </span>
  );
}
