import { useGetProfile } from "../api/auth";

function Profile() {

  const { data } = useGetProfile();

  return (
    <div>{data && `Profile of ${data.username}`}</div>
  )
}

export default Profile;
