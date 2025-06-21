export function formatPrice(value: number | string): string {
    const number = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(number)) return "0.00";

    return new Intl.NumberFormat("en-MY", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(number);
}