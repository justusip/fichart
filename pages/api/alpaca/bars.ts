import type {NextApiRequest, NextApiResponse} from 'next';
import Alpaca from "@alpacahq/alpaca-trade-api";
import moment from "moment";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const {from, to, scale} = req.query;

    const alpaca = new Alpaca({
        keyId: "PKDUYVG30WKGIUGQ2MA4",
        secretKey: "3dxMO3dLdjr4UgvN1kJTlZ0fmEyrctOVlh0tynM6",
        paper: false
    });
    const got = alpaca.getBarsV2("TSLA", {
        start: from, //"2020-01-01"
        end: to, //"2022-06-08",
        timeframe: alpaca.newTimeframe(1, alpaca.timeframeUnit.DAY),
        feed: "sip"
    });
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
