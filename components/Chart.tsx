import React, {useCallback, useEffect, useState} from "react";
import Interval from "../misc/Interval";
import moment from "moment";
import {useDispatch, useSelector} from "react-redux";
import IndicatorData from "../indicators/IndicatorData";
import AllIndicators from "../indicators/AllIndicators";
import Context from "../indicators/Context";
import {useResizeDetector} from "react-resize-detector";

export default function Chart(props: {
    className: string,
    data: Interval[]
}) {
    const indiData: IndicatorData[] = useSelector((state: any) => state.indicators.value);
    const dispatch = useDispatch();

    const onResize = useCallback((width: number, height: number) => {
        setCvsWidth(width * window.devicePixelRatio);
        setCvsHeight(height * window.devicePixelRatio);
    }, []);
    const {width, height, ref} = useResizeDetector({onResize});
    const [cvsWidth, setCvsWidth] = useState(0);
    const [cvsHeight, setCvsHeight] = useState(0);

    let [dragging, setDragging] = useState(false);
    let [showCursor, setShowCursor] = useState(false);
    let [mouseX, setMouseX] = useState(0);
    let [mouseY, setMouseY] = useState(0);

    let maxTimeRange = 30 * 24 * 60 * 60; //1 month
    let minTimeRange = 60 * 60;

    let [boundLeft, setBoundLeft] = useState(1611883800);
    let [boundRight, setBoundRight] = useState(boundLeft + 4 * 60 * 60);
    let [boundBottom, setBoundBottom] = useState(10);
    let [boundTop, setBoundTop] = useState(20);

    let boundTimeRange = boundRight - boundLeft;
    let boundPriceRange = boundTop - boundBottom;

    let [boundVolTop, setBoundVolTop] = useState(100000000);

    useEffect(() => {
        draw();
    }, [
        props.data, indiData,
        cvsWidth, cvsHeight,
        boundLeft, boundRight, boundBottom, boundTop, boundVolTop,
        mouseX, mouseY, dragging, showCursor
    ]);

    const s = {
        background: "#2d2d2d",
        grid: "#404040",
        divisor: "#777",
        cursorHighlight: "#ffffff33",
        bodyRisen: "#51ab82",
        bodyDropped: "#8a3334",
        text: "#777"
        // shadow: "#464e56",
        // overview: "#777" // When the graph is shrunk horizontally to extreme and the candle bodies are not visible
    };

    // +-------------------------------------------------------------------------+
    // |                                    |                                    |
    // |                                    |                                    |
    // |                                    | [mouseY, ctx.fillRect(...)]        |
    // |    [ctx.fillRect(...) / mouseX]    |                                    |
    // |             xToTime(x)             |                                    |
    // |------------------------------------+------------------------------------|
    // |                                    |                                    |
    // |                                    |                                    |
    // |                                    | yToPrice(y)                        |
    // |                                    |                                    |
    // |                                    |                                    |
    // +-------------------------------------------------------------------------+

    const drawText = (
        ctx: CanvasRenderingContext2D,
        msg: string,
        x: number,
        y: number,
        colour: string,
    ) => {
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = colour;
        ctx.font = `${12 * devicePixelRatio}px PlexSans`;
        ctx.fillText(msg, x, cvsHeight - y);
    };
    const drawTextbox = (
        ctx: CanvasRenderingContext2D,
        msg: string,
        x: number,
        y: number,
        colour: string,
        bg: string
    ) => {
        const padding = 16 * devicePixelRatio;

        // Draws background
        ctx.fillStyle = bg;
        const rectWidth = measureTextWidth(ctx, msg) + padding;
        const rectHeight = measureTextHeight(ctx, msg) + padding;
        ctx.fillRect(x - (rectWidth / 2), cvsHeight - y - (rectHeight / 2), rectWidth, rectHeight);

        // Draws text
        drawText(ctx, msg, x, y, colour);
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

    let volumeHeight = 100;
    let bottomHeight = 0;
    let chartHeight = cvsHeight - volumeHeight - bottomHeight;
    let rightWidth = 60;
    let chartWidth = cvsWidth - rightWidth;

    const timeStep = 1 * 60;
    const xToTime = (x: number) => x / chartWidth * boundTimeRange + boundLeft;
    const timeToX = (time: number) => (time - boundLeft) / boundTimeRange * chartWidth;

    const priceStep = 1.0;
    const yToPrice = (y: number) => y / cvsHeight * boundPriceRange + boundBottom;
    const priceToY = (price: number) => (price - boundBottom) / boundPriceRange * chartHeight + volumeHeight + bottomHeight;

    const timesPerGridline = [10 * 60, 30 * 60, 60 * 60];
    const timePerGridline = 10 * 60;
    const pricePerGridline = 1;

    const findData = (time: number) => props.data.find(interval => interval.time === time); //TODO optimize
    const rectPadding = 2;

    const prevStep = (val: number, step: number) => Math.floor(val / step) * step;
    const nextStep = (val: number, step: number) => Math.ceil(val / step) * step;

    useEffect(() => {
    }, []);
    const draw = () => {
        const ctx = ref.current.getContext("2d");
        ctx.fillStyle = s.background;
        ctx.fillRect(0, 0, cvsWidth, cvsHeight);

        bottomHeight = measureTextHeight(ctx, "1.234567890") + 16 * devicePixelRatio;
        rightWidth = measureTextWidth(ctx, "14.00") + 16 * devicePixelRatio;
        chartHeight = cvsHeight - volumeHeight - bottomHeight;
        chartWidth = cvsWidth - rightWidth;

        // Finding boundaries
        //TODO
        setBoundTop(props.data.map(interval => interval.high).sort((a, b) => b - a)[0] + 3);
        setBoundBottom(props.data.map(interval => interval.low).sort((a, b) => a - b)[0] - 3);
        setBoundVolTop(props.data.map(interval => interval.volume).sort((a, b) => b - a)[0]);

        // Draw Grid
        {
            ctx.fillStyle = s.grid;
            // Horizontal lines (Prices)
            for (
                let price = nextStep(boundBottom, pricePerGridline);
                price < nextStep(boundTop, pricePerGridline);
                price++
            ) {
                const y = priceToY(price);
                ctx.fillRect(0, cvsHeight - y, chartWidth, 1);
            }
            // Vertical lines (Times)
            for (
                let time = nextStep(boundLeft, timePerGridline);
                time <= prevStep(boundRight, timePerGridline);
                time += timePerGridline
            ) {
                const x = timeToX(time);
                ctx.fillRect(x, 0, 1, chartHeight + volumeHeight);
            }
        }

        // Draw candlesticks and volume bars
        for (
            let time = prevStep(boundLeft, timeStep);
            time <= nextStep(boundRight, timeStep);
            time += timeStep
        ) {
            const interval = findData(time);

            const segLeft = timeToX(time);
            const segRight = timeToX(time + timeStep);
            const segWidth = segRight - segLeft;
            const segCenter = (segLeft + segRight) / 2;

            if (!interval) {
                ctx.fillStyle = "#222";
                ctx.fillRect(segLeft, 0, segRight - segLeft, cvsHeight - bottomHeight);
                continue;
            }

            const rectLeft = segLeft + rectPadding;
            const rectRight = segRight - rectPadding + 1;
            const rectWidth = rectRight - rectLeft;

            const risen = interval.close > interval.open;
            ctx.fillStyle = risen ? s.bodyRisen : s.bodyDropped;

            // Draw Shadow
            const lineTop = priceToY(interval.high);
            const lineBottom = priceToY(interval.low);
            ctx.fillRect(segCenter, cvsHeight - lineTop, 1, lineTop - lineBottom);

            // Draw Body
            if (rectWidth > 0) {
                const higherEnd = risen ? interval.open : interval.close;
                const rectTop = priceToY(higherEnd);

                const lowerEnd = !risen ? interval.open : interval.close;
                const rectBottom = priceToY(lowerEnd);

                ctx.fillRect(rectLeft, cvsHeight - rectTop, rectWidth, rectTop - rectBottom);
            }

            // Draw Volume
            const volTop = interval.volume / boundVolTop * volumeHeight + bottomHeight;
            const volBottom = bottomHeight;
            ctx.fillRect(rectLeft, cvsHeight - volTop, Math.max(rectWidth, 1), volTop - volBottom);
        }

        {
            const context: Context = {
                plot: (data: { time: number, price: number }[], colour: string) => {
                    ctx.strokeStyle = colour;
                    let prevPos: { x: number, y: number } | null = null;
                    for (
                        let time = prevStep(boundLeft, timeStep);
                        time <= nextStep(boundRight, timeStep);
                        time += timeStep
                    ) {
                        const entry = data.find(o => o.time === time);
                        if (!entry)
                            continue;
                        const price = entry.price;
                        if (!price)
                            continue;

                        const segLeft = timeToX(time);
                        const segRight = timeToX(time + timeStep);
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
            for (const indi of indiData) {
                const indiExecutor = AllIndicators.find(o => o.name === indi.name);
                indiExecutor.calculate(props.data, indi.options, context);
            }
        }

        // Draw borders and labels
        {
            // Draws background for right outer area to hide that 1 bar out of the inner area
            ctx.fillStyle = s.background;
            ctx.fillRect(chartWidth, 0, cvsWidth - chartWidth, cvsHeight);

            //Prices
            for (
                let price = nextStep(boundBottom, pricePerGridline);
                price < nextStep(boundTop, pricePerGridline);
                price++
            ) {
                const y = priceToY(price);
                const val = price.toFixed(2);
                drawText(ctx, val, cvsWidth - (rightWidth / 2), y, s.text);
            }

            //Times
            for (
                let time = nextStep(boundLeft, timePerGridline);
                time <= prevStep(boundRight, timePerGridline);
                time += timePerGridline
            ) {
                const x = timeToX(time + (timeStep / 2));
                const val = moment(time * 1000).format("HH:mm");
                drawText(ctx, val, x, bottomHeight / 2, s.text);
            }

            ctx.fillStyle = s.divisor;
            ctx.fillRect(0, chartHeight, chartWidth, 1); // Divisor between candlesticks and volume
            ctx.fillRect(0, chartHeight + volumeHeight, cvsWidth, 1); // Divisor between volume and numbers
            ctx.fillRect(chartWidth, 0, 1, cvsHeight); // Divisor between chart and numbers
        }

        // Draw Cursor
        if (showCursor && mouseX < chartWidth && mouseY < cvsHeight - bottomHeight) {
            const price = yToPrice(cvsHeight - mouseY);
            const time = prevStep(xToTime(mouseX), timeStep);

            // Horizontal Label
            const priceLblText = price.toFixed(2);
            const priceLblCenter = (chartWidth + cvsWidth) / 2;
            drawTextbox(ctx, priceLblText, priceLblCenter, cvsHeight - mouseY, "#fff", "#777");

            // Horizontal Line
            ctx.fillStyle = s.cursorHighlight;
            ctx.fillRect(0, mouseY, chartWidth, 1);

            const rectLeft = timeToX(time);
            const rectRight = timeToX(time + timeStep);
            const rectWidth = rectRight - rectLeft;
            const rectCenter = (rectLeft + rectRight) / 2;

            // Vertical Line
            ctx.fillStyle = s.cursorHighlight;
            ctx.fillRect(rectLeft, 0, rectWidth, cvsHeight - bottomHeight);

            // Vertical Label
            const timeVal = moment(time * 1000).format("DD/MM/YYYY HH:mm:ss");
            drawTextbox(ctx, timeVal, rectCenter, bottomHeight / 2, "#fff", "#777");
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
        // if (mouseX < 0 || mouseY < 0 || mouseX > elmRect.width || mouseY > elmRect.height)
        //     dragging = false;
        // else
        //     dragging = true

        if (dragging) {
            const offsetX = e.movementX;
            const offsetTime = offsetX / ref.current.clientWidth * boundTimeRange;
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

        // if (newBoundTimeRange > maxTimeRange) {
        //     boundLeft = pivot - (maxTimeRange / 2);
        //     boundRight = pivot + (maxTimeRange / 2);
        // } else if (newBoundTimeRange < minTimeRange) {
        //     boundLeft = pivot - (minTimeRange / 2);
        //     boundRight = pivot + (minTimeRange / 2);
        // }

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
