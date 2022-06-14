export interface TimeScale {
    name: string,
    timeStep: number,
    gridStep: number,
    displayFormat: string,
    isGridStep?: (time: number) => boolean
}
