import { Button } from "@mui/material";
import Sketch from "react-p5";
import useWebSocket from "react-use-websocket";
import { urls } from "../api/utils";
import { draw, setup } from "../pong/player";


const Pong = () => {
    const { sendJsonMessage, sendMessage } = useWebSocket(`${urls.wsUrl}/pong`, {
        
    })

    const playAny = () => {
        const message = { event: 'play'}
        sendMessage(JSON.stringify(message))
    }

    return (
        <>
        <Button onClick={playAny} >Random</Button>
        <Sketch setup={setup} draw={draw} />
        </>
    )
}

export default Pong;