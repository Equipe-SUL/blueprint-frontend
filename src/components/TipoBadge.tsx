import {
    Fire,
    Lightning,
    Wall,
    Drop,
    Shield
} from "phosphor-react";

type TipoBadgeProps = {
    tipo: string;
};

function formatTipo(tipo: string) {
    return tipo
        .replaceAll("_", " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
}

function getTipoMeta(tipo: string) {
    switch (tipo) {
        case "eletrica":
            return {
                icon: <Lightning size={12} weight="bold" />,
                className: "tipo-eletrica",
            };
        case "hidraulica":
            return {
                icon: <Drop size={12} weight="bold" />,
                className: "tipo-hidraulica",
            };
        case "alvenaria":
            return {
                icon: <Wall size={12} weight="bold" />,
                className: "tipo-alvenaria",
            };
        case "spda":
            return {
                icon: <Shield size={12} weight="bold" />,
                className: "tipo-spda",
            };
        case "combate_a_incendio":
            return {
                icon: <Fire size={12} weight="bold" />,
                className: "tipo-combate_a_incendio",
            };
        default:
            return {
                icon: <Shield size={12} weight="bold" />,
                className: "tipo-default",
            };
    }
}

export default function TipoBadge({ tipo }: TipoBadgeProps) {
    const meta = getTipoMeta(tipo);

    return (
        <span className={`tipo-badge ${meta.className}`}>
            {meta.icon}
            {formatTipo(tipo)}
        </span>
    );
}
