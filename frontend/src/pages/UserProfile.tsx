import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useGetUserById } from "../api/user";

const UserProfile = () => {
    const param = useParams();
    const { user } = useGetUserById(parseInt(param.id as string));
    useEffect(() => {
        console.log(param);
    }, [param])
    return (
        <div>{user?.login42}</div>
    )
}

export default UserProfile;