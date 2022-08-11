import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import Interval from "../misc/Interval";
import moment from "moment";
import {useDispatch, useSelector} from "react-redux";
import AddedIndicator from "../indicators/AddedIndicator";
import IndicatorProcessors from "../indicators/AllIndicators";
import Context from "../indicators/Context";
import {useResizeDetector} from "react-resize-detector";
import Rect from "../misc/Rect";
import {TimeScale} from "../misc/TimeScale";

export default function ChartCanvas(props: {
    className: string,
    data: Interval[],
    timeStep: number,
    gridTimeStep: number,
    valueDateFormat: string,
    timeScale: TimeScale,
    onTimeBoundsChange?: (boundLeft: number, boundRight: number) => void
}) {
    const addedIndicators: AddedIndicator[] = useSelector((state: any) => state.indicators.value);
    const dispatch = useDispatch();

    const [cvsWidth, setCvsWidth] = useState(0);
    const [cvsHeight, setCvsHeight] = useState(0);
    const onResize = useCallback((width: number, height: number) => {
        setCvsWidth(width * window.devicePixelRatio);
        setCvsHeight(height * window.devicePixelRatio);
    }, []);
    const {width, height, ref} = useResizeDetector({onResize});

    let [dragging, setDragging] = useState(false);
    let [showCursor, setShowCursor] = useState(false);
    let [mouseX, setMouseX] = useState(0);
    let [mouseY, setMouseY] = useState(0);

    let minTimeRange = 3 * props.gridTimeStep;
    let maxTimeRange = 50 * props.gridTimeStep;

    let [boundLeft, setBoundLeft] = useState(moment().unix() - 100 * props.timeStep);
    let [boundRight, setBoundRight] = useState(boundLeft + 100 * props.timeStep);
    let [boundBottom, setBoundBottom] = useState(10);
    let [boundTop, setBoundTop] = useState(20);
    let boundTimeRange = useMemo(() => boundRight - boundLeft, [boundLeft, boundRight]);
    let boundPriceRange = useMemo(() => boundTop - boundBottom, [boundTop, boundBottom]);
    useEffect(() => {
        if (props.onTimeBoundsChange)
            props.onTimeBoundsChange(boundLeft, boundRight);
    }, [boundLeft, boundRight]);

    let [boundVolTop, setBoundVolTop] = useState(100000000);

    const styles = {
        background: "#2d2d2d",
        grid: "#404040",
        divisor: "#777",
        cursorHighlight: "#ffffff44",
        bodyRisen: "#51ab82",
        bodyDropped: "#8a3334",
        text: "#777"
        // shadow: "#464e56",
        // overview: "#777" // When the graph is shrunk horizontally to extreme and the candle bodies are not visible
    };

    const measureText = (ctx: CanvasRenderingContext2D, msg: string): TextMetrics => {
        ctx.font = `${12 * devicePixelRatio}px PlexSans`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        return ctx.measureText(msg);
    };
    const measureTextWidth = (ctx: CanvasRenderingContext2D, msg: string): number => {
        const textMetrics = measureText(ctx, msg);
        return Math.abs(textMetrics.actualBoundingBoxLeft) + Math.abs(textMetrics.actualBoundingBoxRight);
    };
    const measureTextHeight = (ctx: CanvasRenderingContext2D, msg: string): number => {
        const textMetrics = measureText(ctx, msg);
        return Math.abs(textMetrics.actualBoundingBoxAscent) + Math.abs(textMetrics.actualBoundingBoxDescent);
    };
    const drawCtrText = (
        ctx: CanvasRenderingContext2D,
        msg: string,
        centerX: number,
        centerY: number,
        colour: string,
    ) => {
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = colour;
        ctx.font = `${12 * devicePixelRatio}px PlexSans`;
        ctx.fillText(msg, centerX, cvsHeight - centerY);
    };

    const pricePerGridline = 10;
    const findData = (time: number) => props.data.find(interval => interval.t === time); //TODO optimize

    useEffect(() => {
        draw();
    }, [
        props.data, addedIndicators,
        cvsWidth, cvsHeight,
        boundLeft, boundRight, boundBottom, boundTop, boundVolTop,
        mouseX, mouseY, dragging, showCursor
    ]);
    let xToTime: any = null; //TEMP
    const draw = () => {
        const ctx = ref.current.getContext("2d");
        ctx.fillStyle = styles.background;
        ctx.fillRect(0, 0, cvsWidth, cvsHeight);

        const rect = (x: number, y: number, w: number, h: number): Rect => {
            const r = new Rect();
            r.l = x;
            r.r = x + w;
            r.t = y;
            r.b = y + h;
            r.w = w;
            r.h = h;
            r.cx = (r.l + r.r) / 2;
            r.cy = (r.t + r.b) / 2;
            return r;
        };

        let cvs = rect(0, 0, cvsWidth, cvsHeight);
        let hh = measureTextHeight(ctx, "1.234567890") + 16 * devicePixelRatio;
        let ww = measureTextWidth(ctx, "140.00") + 16 * devicePixelRatio;
        let vol = rect(0, cvs.h - hh - 100, cvs.w - ww, 100);
        let plot = rect(0, 0, cvs.w - ww, cvs.h - hh - vol.h);
        let bottomAxis = rect(0, cvs.h - hh, cvs.w - ww, hh);
        let rightAxis = rect(cvs.w - ww, 0, ww, cvs.h - hh);

        xToTime = (x: number) => x / plot.w * boundTimeRange + boundLeft;
        const timeToX = (time: number) => (time - boundLeft) / boundTimeRange * plot.w;
        const yToPrice = (y: number) => (y - bottomAxis.h - vol.h) / plot.h * boundPriceRange + boundBottom;
        const priceToY = (price: number) => (price - boundBottom) / boundPriceRange * plot.h + vol.h + bottomAxis.h;
        const prevStep = (val: number, step: number) => Math.floor(val / step) * step;
        const nextStep = (val: number, step: number) => Math.ceil(val / step) * step;

        // Finding boundaries
        let newBoundTop = -Infinity;
        let newBoundBottom = Infinity;
        let newBoundVolTop = -Infinity;
        for (
            let time = prevStep(boundLeft, props.timeStep * 20);
            time <= nextStep(boundRight, props.timeStep * 20);
            time += props.timeStep
        ) {
            const interval = findData(time);
            if (!interval)
                continue;
            if (interval.l < newBoundBottom)
                newBoundBottom = interval.l;
            if (interval.h > newBoundTop)
                newBoundTop = interval.h;
            if (interval.v > newBoundVolTop)
                newBoundVolTop = interval.v;
        }
        setBoundTop(newBoundTop + pricePerGridline);
        setBoundBottom(newBoundBottom - pricePerGridline);
        setBoundVolTop(newBoundVolTop);

        // Draw candlesticks and volume bars
        for (
            let time = prevStep(boundLeft, props.timeStep);
            time <= nextStep(boundRight, props.timeStep);
            time += props.timeStep
        ) {
            const interval = findData(time);

            const segLeft = timeToX(time);
            const segRight = timeToX(time + props.timeStep);
            const segWidth = segRight - segLeft;
            const segCenter = (segLeft + segRight) / 2;

            if (!interval) {
                ctx.fillStyle = "#282828";
                ctx.fillRect(segLeft, 0, segRight - segLeft, bottomAxis.t);
                continue;
            }

            const rectPadding = 150 * props.timeStep / boundTimeRange * devicePixelRatio;
            const rectLeft = segLeft + rectPadding;
            const rectRight = segRight - rectPadding;
            const rectWidth = rectRight - rectLeft;

            const risen = interval.c > interval.o;
            ctx.fillStyle = risen ? styles.bodyRisen : styles.bodyDropped;

            // Draw Shadow
            const lineTop = priceToY(interval.h);
            const lineBottom = priceToY(interval.l);
            ctx.fillRect(segCenter, cvsHeight - lineTop, 1, lineTop - lineBottom);

            // Draw Body
            if (rectWidth > 0) {
                const higherEnd = risen ? interval.o : interval.c;
                const rectTop = priceToY(higherEnd);

                const lowerEnd = !risen ? interval.o : interval.c;
                const rectBottom = priceToY(lowerEnd);

                ctx.fillRect(rectLeft, cvsHeight - rectTop, rectWidth, rectTop - rectBottom);
            }

            // Draw Volume
            const volTop = interval.v / boundVolTop * vol.h + bottomAxis.h;
            const volBottom = bottomAxis.h;
            ctx.fillRect(rectLeft, cvsHeight - volTop, Math.max(rectWidth, 1), volTop - volBottom);
        }

        // Calculate and draw indicator
        {
            const context: Context = {
                plot: (data: { time: number, price: number }[], colour: string) => {
                    ctx.strokeStyle = colour;
                    let prevPos: { x: number, y: number } | null = null;
                    for (
                        let time = prevStep(boundLeft, props.timeStep * 10); //TODO dynamic safe area
                        time <= nextStep(boundRight, props.timeStep * 10);
                        time += props.timeStep
                    ) {
                        const entry = data.find(o => o.time === time);
                        if (!entry)
                            continue;
                        const price = entry.price;
                        if (!price)
                            continue;

                        const segLeft = timeToX(time);
                        const segRight = timeToX(time + props.timeStep);
                        const segCenter = (segLeft + segRight) / 2;

                        const x = segCenter;
                        const y = priceToY(price);

                        if (!!prevPos) {
                            ctx.beginPath();
                            ctx.moveTo(prevPos.x, cvsHeight - prevPos.y);
                            ctx.lineTo(x, cvsHeight - y);
                            ctx.stroke();
                            ctx.closePath();
                        }
                        prevPos = {x, y};
                    }
                }
            };
            for (const indicator of addedIndicators) {
                const indicatorProcessor = IndicatorProcessors.find(o => o.name === indicator.name);
                indicatorProcessor.calculate(props.data, indicator.options, context);
            }
        }

        // Draw border and grid (grid lines and values)
        {
            // Draws background for right outer area to hide that 1 bar out of the inner area
            ctx.fillStyle = styles.background;
            ctx.fillRect(rightAxis.l, 0, rightAxis.w, rightAxis.h);

            //Prices
            for (
                let price = nextStep(boundBottom, pricePerGridline);
                price < nextStep(boundTop, pricePerGridline);
                price += pricePerGridline
            ) {
                const y = priceToY(price);
                const val = price.toFixed(2);
                drawCtrText(ctx, val, rightAxis.cx, y, styles.text);
                ctx.fillStyle = styles.grid;
                ctx.fillRect(0, cvsHeight - y, plot.w, 1);
            }

            //Times
            for (
                let time = prevStep(boundLeft, props.timeStep * 10);
                time <= nextStep(boundRight, props.timeStep * 10);
                time += props.timeStep
            ) {
                if (props.timeScale.isGridStep) { //TODO?
                    if (!props.timeScale.isGridStep(time))
                        continue;
                } else {
                    if (time % props.gridTimeStep !== 0)
                        continue;
                }
                const x = timeToX(time);
                const labelX = timeToX(time + props.timeStep / 2);
                const val = moment(time * 1000).format(props.valueDateFormat);
                drawCtrText(ctx, val, labelX, cvsHeight - bottomAxis.cy, styles.text);
                if (x < plot.w) {
                    ctx.fillStyle = styles.grid;
                    ctx.fillRect(x, 0, 1, plot.h + vol.h);
                }
            }

            ctx.fillStyle = styles.divisor;
            ctx.fillRect(0, vol.t, vol.w, 1); // Divisor between candlesticks and volume
            ctx.fillRect(0, bottomAxis.t, cvs.w, 1); // Divisor between plot and bottom axis
            ctx.fillRect(rightAxis.l, 0, 1, cvs.h); // Divisor between plot and right axis

            ctx.fillStyle = styles.background;
            ctx.fillRect(bottomAxis.r + 1, rightAxis.b + 1, rightAxis.w, bottomAxis.h);
        }

        // Draw Cursor
        if (showCursor && mouseX < plot.w && mouseY < bottomAxis.t) {
            const price = yToPrice(cvsHeight - mouseY);
            const time = prevStep(xToTime(mouseX), props.timeStep);

            // Cursor Horizontal Line
            ctx.fillStyle = "#fff";
            ctx.fillRect(0, mouseY, plot.w, 1);

            // Vertical Axis Value (Cursor Pointed Price)
            const priceLblText = price.toFixed(2);
            const priceLblBgHeight = measureTextHeight(ctx, priceLblText) + 16 * devicePixelRatio;
            ctx.fillStyle = "#fff";
            ctx.fillRect(rightAxis.l, mouseY - (priceLblBgHeight / 2), rightAxis.w, priceLblBgHeight);
            ctx.beginPath();
            ctx.moveTo(rightAxis.l - (10 * devicePixelRatio), mouseY);
            ctx.lineTo(rightAxis.l + 1, mouseY - (priceLblBgHeight / 2));
            ctx.lineTo(rightAxis.l + 1, mouseY + (priceLblBgHeight / 2));
            ctx.fill();
            drawCtrText(ctx, priceLblText, rightAxis.cx, cvsHeight - mouseY, "#000");

            // Vertical Bar Highlight
            const hl = rect(timeToX(time), 0, timeToX(time + props.timeStep) - timeToX(time), plot.h + vol.h); //TODO
            ctx.fillStyle = "#ffffff22";
            ctx.fillRect(hl.l, hl.t, hl.w, hl.h);

            // Cursor Vertical Line
            ctx.fillStyle = "#fff";
            ctx.fillRect(hl.cx, hl.t, 1, hl.h);

            // Horizontal Axis Value (Cursor Pointed Time)
            const bottomLblVal = moment(time * 1000).format(props.valueDateFormat);
            const bottomLblBgWidth = measureTextWidth(ctx, bottomLblVal) + 16 * devicePixelRatio;
            ctx.fillStyle = "#fff";
            ctx.fillRect(hl.cx - (bottomLblBgWidth / 2), bottomAxis.t, bottomLblBgWidth, bottomAxis.h);
            ctx.beginPath();
            ctx.moveTo(hl.cx, bottomAxis.t - (10 * devicePixelRatio));
            ctx.lineTo(hl.cx - (16 * devicePixelRatio), bottomAxis.t);
            ctx.lineTo(hl.cx + (16 * devicePixelRatio), bottomAxis.t);
            ctx.fill();
            drawCtrText(ctx, bottomLblVal, hl.cx, bottomAxis.h / 2, "#000");
        }
    };

    const onMouseEnter = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setShowCursor(true);
    };

    const onMouseOut = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setShowCursor(false);
        setDragging(false);
    };

    const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setDragging(true);
    };

    const onMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setDragging(false);
    };

    const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const elmRect = ref.current.getBoundingClientRect();
        setMouseX((e.clientX - elmRect.left) * devicePixelRatio);
        setMouseY((e.clientY - elmRect.top) * devicePixelRatio);

        if (dragging) {
            const offsetX = e.movementX;
            const offsetTime = offsetX / width * boundTimeRange;
            setBoundLeft(boundLeft - offsetTime);
            setBoundRight(boundRight - offsetTime);
        }
    };

    const onWheel = (e: React.WheelEvent) => {
        const delta = e.deltaY;
        const scale = 1.08;
        const multiplier = (delta > 0) ? scale : (1 / scale);
        const pivot = xToTime(e.clientX);

        const newBoundLeft = pivot - ((pivot - boundLeft) * multiplier);
        const newBoundRight = pivot + ((boundRight - pivot) * multiplier);
        const newBoundTimeRange = boundRight - boundLeft;
        if (newBoundTimeRange > maxTimeRange && multiplier > 1) {
            return;
        } else if (newBoundTimeRange < minTimeRange && multiplier < 1) {
            return;
        }
        setBoundLeft(newBoundLeft);
        setBoundRight(newBoundRight);
    };

    return <div className={props.className}>
        <canvas ref={ref}
                width={cvsWidth}
                height={cvsHeight}
                className="w-full h-full cursor-crosshair"
                onMouseOver={onMouseEnter}
                onMouseOut={onMouseOut}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                onMouseMove={onMouseMove}
                onWheel={onWheel}
                style={{cursor: dragging ? "grabbing" : null}}>
        </canvas>
    </div>;
}
