import type {NextApiRequest, NextApiResponse} from 'next';
import Alpaca from "@alpacahq/alpaca-trade-api";
import moment from "moment";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const {from, to, scale} = req.query;

    //alphavantage = K5AO5WR7PMCPCC6V
    fetch("https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=AAPL&apikey=K5AO5WR7PMCPCC6V")

    let bars: any = [];
    for await(const o of got) {
        bars.push({
            t: moment(o["Timestamp"]).utc().hour(0).unix(),
            o: o["OpenPrice"],
            h: o["HighPrice"],
            l: o["LowPrice"],
            c: o["ClosePrice"],
            v: o["Volume"],
        });
    }
    res.json(bars);
}
