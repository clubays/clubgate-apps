import { useClubgate } from "@/context/ClubgateContext";
import Avatar from "@/components/Avatar";

export default function Profile() {
  const { profile } = useClubgate();
  const links = profile.links ?? [];
  return (
    <article className="panel profile">
      <div
        className="cover"
        style={
          profile.coverimage
            ? { backgroundImage: `url(${profile.coverimage})` }
            : undefined
        }
      />
      <div className="profile-head">
        <Avatar src={profile.profileimage} name={profile.name} size={96} />
        <div>
          <h1>{profile.name}</h1>
          <p className="muted">@{profile.username}</p>
        </div>
      </div>
      {profile.bio && <p className="bio">{profile.bio}</p>}
      {profile.description && <p>{profile.description}</p>}
      {links.length > 0 && (
        <>
          <h2>Links</h2>
          <ul className="links">
            {links.map((l) => (
              <li key={l}>
                <a href={l} target="_blank" rel="noreferrer noopener">
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
      {!profile.bio && !profile.description && links.length === 0 && (
        <p className="muted">This profile has no bio or links yet.</p>
      )}
    </article>
  );
}
