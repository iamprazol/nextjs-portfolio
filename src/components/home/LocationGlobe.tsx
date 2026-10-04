import { MonoLabel, Panel } from "@/components/ui";

const rad = (degrees: number) => (degrees * Math.PI) / 180;

// The globe has no map on it, so the view is simply turned to keep the pin on
// the visible side: the camera sits 24° west of the pin's longitude and 14°
// north of the equator. Only the latitude then changes where the pin lands.
const VIEW_LAT = 14;
const VIEW_LNG_OFFSET = 24;

/** Orthographic projection of the location onto the disc, as percentages. */
function project(lat: number) {
    const phi = rad(lat);
    const phi0 = rad(VIEW_LAT);
    const delta = rad(VIEW_LNG_OFFSET);

    const x = Math.cos(phi) * Math.sin(delta);
    const y = Math.cos(phi0) * Math.sin(phi) - Math.sin(phi0) * Math.cos(phi) * Math.cos(delta);
    return { left: 50 + 50 * x, top: 50 - 50 * y };
}

function formatCoordinates(lat: number, lng: number) {
    const part = (value: number, positive: string, negative: string) =>
        `${Math.abs(value).toFixed(4)}° ${value >= 0 ? positive : negative}`;
    return `${part(lat, "N", "S")}, ${part(lng, "E", "W")}`;
}

type LocationGlobeProps = { label: string; lat: number; lng: number };

/** A CSS-only globe with a pin at the owner's location. */
export function LocationGlobe({ label, lat, lng }: LocationGlobeProps) {
    const pin = project(lat);
    const coordinates = formatCoordinates(lat, lng);

    return (
        <Panel className="text-center">
            <div
                role="img"
                aria-label={`Globe with a pin at ${label} (${coordinates})`}
                className="relative mx-auto my-3 aspect-square w-full max-w-[200px]"
            >
                <div className="globe-sphere border-line-2 absolute inset-0 overflow-hidden rounded-full border">
                    <div className="globe-dots absolute inset-0 opacity-70" />
                </div>
                {/* Tilted orbit */}
                <div className="border-wire absolute -inset-[7%] scale-y-[.34] -rotate-[18deg] rounded-full border opacity-70" />
                <span
                    className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${pin.left}%`, top: `${pin.top}%` }}
                >
                    <span className="bg-acc absolute inset-0 rounded-full opacity-60 motion-safe:animate-ping" />
                    <span className="bg-acc absolute inset-0 rounded-full" />
                </span>
            </div>
            <MonoLabel as="p" className="text-ink-2 mt-4">
                {label}
            </MonoLabel>
            <p className="text-mute mt-1 font-mono text-xs">{coordinates}</p>
        </Panel>
    );
}
