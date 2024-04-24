
export const makeDateTimeStringFromDate = (dateTime) => {

    if(dateTime === null || dateTime === undefined) {
        return '';
    }

    let fullYear = dateTime.getFullYear();
    let month = dateTime.getMonth()+1;
    let date = dateTime.getDate();
    let hour = dateTime.getHours();
    let minute = dateTime.getMinutes();
    let second = dateTime.getSeconds();

    month = (month<10?'0'+month:month);
    date = (date<10?'0'+date:date);
    hour = (hour<10?'0'+hour:hour);
    minute = (minute<10?'0'+minute:minute);
    second = (second<10?'0'+second:second);

    return `${fullYear}-${month}-${date} ${hour}:${minute}:${second}`;
};