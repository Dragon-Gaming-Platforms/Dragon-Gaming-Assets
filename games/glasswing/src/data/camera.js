// Rendering only: keep players and their wings visible without changing simulation/replays.
// Horizontal follow (seconds and tiles): look-ahead blend time, soft dead zone, spring smooth time,
// and the jump in player position that cuts instead of panning (respawn, area change).
export const CAMERA={fov:38,tilt:.1,minWidth:8,portraitAspect:4/3,padX:1,padY:1.5,ease:.12,lookTime:.4,dead:.6,smoothTime:.2,snap:4};
