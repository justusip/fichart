export default interface Context {
    plot: (data: { time: number, price: number }[], colour: string) => void;
}
