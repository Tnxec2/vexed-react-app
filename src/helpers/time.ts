
export function formatTime(timeInSeconds?: number) {
    if (!timeInSeconds) return '00:00:00'
    let h,m,s;
    h = Math.floor(timeInSeconds/60/60);
    m = Math.floor((timeInSeconds/60/60 - h)*60);
    s = Math.floor(((timeInSeconds/60/60 - h)*60 - m)*60);
    s < 10 ? s = `0${s}`: s = `${s}`
    m < 10 ? m = `0${m}`: m = `${m}`
    h < 10 ? h = `0${h}`: h = `${h}`


    return `${h}:${m}:${s}`
}