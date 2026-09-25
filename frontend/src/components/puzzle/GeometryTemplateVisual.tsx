type Props = {
  family: string;
  data: Record<string, number | string>;
};

const LINE = "#17101f";
const PURPLE = "#7c3aed";
const RED = "#e0524d";

function Arc({
  d,
  color = LINE,
  width = 4,
}: {
  d: string;
  color?: string;
  width?: number;
}) {
  return <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" />;
}

export function GeometryTemplateVisual({ family, data }: Props) {
  if (family === "parallel_triangle") {
    return (
      <>
        <line x1="55" y1="130" x2="305" y2="130" stroke={LINE} strokeWidth="6" />
        <line x1="80" y1="330" x2="295" y2="330" stroke={LINE} strokeWidth="6" />
        <line x1="105" y1="85" x2="170" y2="330" stroke={LINE} strokeWidth="7" />
        <line x1="170" y1="330" x2="270" y2="185" stroke={LINE} strokeWidth="7" />
        <line x1="270" y1="185" x2="295" y2="330" stroke={LINE} strokeWidth="7" />
        <path d="M285 116 l18 14 l-18 14" fill="none" stroke={PURPLE} strokeWidth="4" />
        <path d="M274 316 l18 14 l-18 14" fill="none" stroke={PURPLE} strokeWidth="4" />
        <Arc d="M117 128 A28 28 0 0 1 126 104" />
        <Arc d="M267 303 A30 30 0 0 1 288 315" />
        <Arc d="M250 205 A34 34 0 0 1 271 220" color={PURPLE} />
        <text x="125" y="112" fontSize="18" fontWeight="900">{String(data.a)}°</text>
        <text x="247" y="310" fontSize="18" fontWeight="900">{String(data.b)}°</text>
        <text x="273" y="220" fontSize="24" fontWeight="900" fill={PURPLE}>x</text>
      </>
    );
  }

  if (family === "isosceles_apex_exterior") {
    return (
      <>
        <path d="M80 330L180 150L280 330Z" fill="none" stroke={LINE} strokeWidth="7" />
        <line x1="180" y1="150" x2="232" y2="78" stroke={LINE} strokeWidth="7" />
        <path d="M118 262 l16 9 M242 262 l-16 9" stroke={PURPLE} strokeWidth="5" />
        <Arc d="M183 152 A42 42 0 0 0 212 178" color={RED} />
        <Arc d="M92 320 A32 32 0 0 1 115 296" color={PURPLE} />
        <text x="215" y="164" fontSize="19" fontWeight="900" fill={RED}>{String(data.e)}°</text>
        <text x="96" y="310" fontSize="24" fontWeight="900" fill={PURPLE}>x</text>
      </>
    );
  }

  if (family === "isosceles_base_exterior") {
    return (
      <>
        <path d="M80 330L180 145L280 330Z" fill="none" stroke={LINE} strokeWidth="7" />
        <line x1="80" y1="330" x2="35" y2="330" stroke={LINE} strokeWidth="7" />
        <path d="M112 262 l16 9 M248 262 l-16 9" stroke={PURPLE} strokeWidth="5" />
        <Arc d="M78 304 A34 34 0 0 0 48 329" color={RED} />
        <Arc d="M157 169 A36 36 0 0 1 203 169" color={PURPLE} />
        <text x="42" y="300" fontSize="19" fontWeight="900" fill={RED}>{String(data.e)}°</text>
        <text x="174" y="186" fontSize="24" fontWeight="900" fill={PURPLE}>x</text>
      </>
    );
  }

  if (family === "right_triangle_exterior") {
    return (
      <>
        <path d="M85 330L85 155L285 330Z" fill="none" stroke={LINE} strokeWidth="7" />
        <line x1="85" y1="155" x2="85" y2="88" stroke={LINE} strokeWidth="7" />
        <path d="M85 306H109V330" fill="none" stroke={PURPLE} strokeWidth="4" />
        <Arc d="M88 157 A39 39 0 0 1 117 181" color={RED} />
        <Arc d="M250 326 A35 35 0 0 1 267 298" color={PURPLE} />
        <text x="112" y="166" fontSize="19" fontWeight="900" fill={RED}>{String(data.e)}°</text>
        <text x="246" y="308" fontSize="24" fontWeight="900" fill={PURPLE}>x</text>
      </>
    );
  }

  if (family === "vertical_triangle") {
    return (
      <>
        <line x1="75" y1="125" x2="285" y2="335" stroke={LINE} strokeWidth="7" />
        <line x1="280" y1="120" x2="80" y2="320" stroke={LINE} strokeWidth="7" />
        <path d="M80 320L285 335L180 225Z" fill="none" stroke={LINE} strokeWidth="7" />
        <Arc d="M146 190 A38 38 0 0 1 175 173" color={RED} />
        <Arc d="M95 313 A31 31 0 0 1 117 292" />
        <Arc d="M260 327 A31 31 0 0 0 240 305" color={PURPLE} />
        <text x="132" y="182" fontSize="19" fontWeight="900" fill={RED}>{String(data.a)}°</text>
        <text x="96" y="300" fontSize="18" fontWeight="900">{String(data.b)}°</text>
        <text x="242" y="313" fontSize="24" fontWeight="900" fill={PURPLE}>x</text>
      </>
    );
  }

  if (family === "parallel_zigzag") {
    return (
      <>
        <line x1="55" y1="125" x2="305" y2="125" stroke={LINE} strokeWidth="6" />
        <line x1="55" y1="335" x2="305" y2="335" stroke={LINE} strokeWidth="6" />
        <path d="M115 125L190 230L120 335" fill="none" stroke={LINE} strokeWidth="7" />
        <path d="M280 111 l18 14 l-18 14" fill="none" stroke={PURPLE} strokeWidth="4" />
        <path d="M280 321 l18 14 l-18 14" fill="none" stroke={PURPLE} strokeWidth="4" />
        <Arc d="M118 128 A34 34 0 0 1 143 145" />
        <Arc d="M124 332 A34 34 0 0 0 145 308" />
        <Arc d="M169 209 A38 38 0 0 1 177 253" color={PURPLE} />
        <text x="137" y="154" fontSize="18" fontWeight="900">{String(data.a)}°</text>
        <text x="137" y="310" fontSize="18" fontWeight="900">{String(data.b)}°</text>
        <text x="198" y="236" fontSize="24" fontWeight="900" fill={PURPLE}>x</text>
      </>
    );
  }

  if (family === "exterior_remote_angles") {
    return (
      <>
        <path d="M75 330L180 150L290 330Z" fill="none" stroke={LINE} strokeWidth="7" />
        <line x1="180" y1="150" x2="225" y2="88" stroke={LINE} strokeWidth="7" />
        <Arc d="M183 152 A42 42 0 0 0 213 180" color={RED} />
        <Arc d="M89 324 A33 33 0 0 1 112 300" />
        <Arc d="M260 324 A33 33 0 0 0 239 300" color={PURPLE} />
        <text x="213" y="166" fontSize="19" fontWeight="900" fill={RED}>{String(data.e)}°</text>
        <text x="95" y="308" fontSize="18" fontWeight="900">{String(data.a)}°</text>
        <text x="245" y="310" fontSize="24" fontWeight="900" fill={PURPLE}>x</text>
      </>
    );
  }

  return (
    <>
      <line x1="55" y1="120" x2="305" y2="120" stroke={LINE} strokeWidth="6" />
      <line x1="55" y1="335" x2="305" y2="335" stroke={LINE} strokeWidth="6" />
      <line x1="95" y1="80" x2="210" y2="335" stroke={LINE} strokeWidth="7" />
      <line x1="210" y1="335" x2="285" y2="220" stroke={LINE} strokeWidth="7" />
      <path d="M280 106 l18 14 l-18 14" fill="none" stroke={PURPLE} strokeWidth="4" />
      <path d="M280 321 l18 14 l-18 14" fill="none" stroke={PURPLE} strokeWidth="4" />
      <Arc d="M111 120 A32 32 0 0 1 123 93" />
      <Arc d="M210 307 A34 34 0 0 1 233 319" />
      <Arc d="M251 234 A34 34 0 0 1 275 252" color={PURPLE} />
      <text x="118" y="101" fontSize="18" fontWeight="900">{String(data.a)}°</text>
      <text x="223" y="319" fontSize="18" fontWeight="900">{String(data.b)}°</text>
      <text x="278" y="250" fontSize="24" fontWeight="900" fill={PURPLE}>x</text>
    </>
  );
}
