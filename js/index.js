//CONST
const citySearchForm = document.querySelector('.city-search-form')
const cityInput = document.querySelector('.city-search-form__input')
const cityShow = document.querySelector('.city-show__name')
const cityTitle = document.querySelector('.city-show__title')
const dailyForecast = document.querySelector('.daily-forecast')
const mainSection = document.querySelector('.main-section')
const detail = document.querySelector('.detail-info')
const backToForecast = document.querySelector('.main-section_button')

//api
const API_KEY = 'key=d402be2835e94504a277b57b4401510b'
const language = 'lang=ru'
const url = 'https://api.weatherbit.io/v2.0/'
const api = {
    fetch : async (method, endpoint, body = null) => {
        let fetchArgs = {
            method: method,
            headers: {
            },
        };
        fetchArgs.headers['Content-Type'] = 'application/json'
        fetchArgs.headers['Accept'] = 'application/json'
        body && (fetchArgs.body = JSON.stringify(body))
        return await fetch(url+endpoint, fetchArgs)
            .then(res => res.json())
    },
}

//state
let city = '';
let countryCode = 'RU';
let latitude = null;
let longitude = null;
let forecastArray = [];
let twoDaysForecast = [];
let selectedDayHours = [];
let currentShowHour = 1;


//actions
const getCurrentPosition = (successCallback, errorCallback = (r) => console.log(r)) => {
    navigator.geolocation.getCurrentPosition(
        position => successCallback(position.coords.latitude, position.coords.longitude),
        () => errorCallback()
    )
}
const getDailyForecastByCoords = () => {
    toggleLoader()
    api.fetch('GET', `forecast/daily?${API_KEY}&${language}&lat=${latitude}&lon=${longitude}`)
        .then(res => {
            setCityName(res.city_name);
            setForecastArray(res.data);
            getTwoDaysForecast()
        })
}

const getDailyForecastByCity = () => {
    toggleLoader()
    api.fetch('GET', `forecast/daily?${API_KEY}&${language}&city=${city}&country=${countryCode}`)
        .then(res => {
            setForecastArray(res.data);
            setCityName(res.city_name);
            getTwoDaysForecast()
        })
        .catch(err => {
            setCityName('');
            setCityTitle('Город не найден');
            setForecastArray([]);
            toggleLoader();
        })
}

const getTwoDaysForecast = () => {
    api.fetch('GET', `forecast/hourly?${API_KEY}&${language}&city=${city}&country=${countryCode}&hours=120`)
        .then(res => {
            setTwoDaysForecast(res.data);
            toggleLoader();
        })
}

//methods
const prependHoursArrayOnDetail = (item) => {
    let carouselWrapper = document.querySelector('.carousel__wrapper')
    carouselWrapper.prepend(item)
}
const appendHoursArrayOnDetail = (item) => {
    let carouselWrapper = document.querySelector('.carousel__wrapper')
    carouselWrapper.append(item)
}
const delFirstHoursArrayOnDetail = () => {
    let carouselItems = document.querySelectorAll('.carousel__item')
    carouselItems[0].remove()
}
const delLastHoursArrayOnDetail = () => {
    let carouselItems = document.querySelectorAll('.carousel__item')
    carouselItems[carouselItems.length - 1].remove()
}
const toggleLoader = () => {
    let ldsRing = document.querySelector('.lds-ring');
    ldsRing.classList.toggle('lds-ring_none')
}
const getWeekDay = (date) => {
    let days = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
    return days[date.getDay()];
}
const goToForecast = () => {
    if (mainSection.classList.contains('main-section_swiped')) {
        mainSection.classList.remove('main-section_swiped')
    }
}
const goToDetails = (date) => {
    let isDeepDetail = false;
    twoDaysForecast.forEach(i => {
        if (checkDates(i.timestamp_local, date)) {
            isDeepDetail = true;
            return;
        }
    })
    let selectedDay = forecastArray.find(i => i.valid_date === date);
    selectedDayHours = twoDaysForecast.filter(i => checkDates(i.timestamp_local, date))
    isDeepDetail? setDetail(selectedDay, selectedDayHours) : setDetail(selectedDay)
    mainSection.classList.add('main-section_swiped')
}

const checkDates = (firstDate, secondDate) => {
    let fDate = new Date(firstDate)
    let sDate = new Date(secondDate)
    return (
        fDate.getFullYear() === sDate.getFullYear() &&
            fDate.getMonth() === sDate.getMonth() &&
            fDate.getDate() === sDate.getDate()
    )
}

const createDiv = (className) => {
    let div = document.createElement('div');
    div.className = className;
    return div;
}
const createImg = (className, src) => {
    let img = document.createElement('img');
    img.src = src;
    img.className = className;
    return img;
}
const createButton = (className) => {
    let button = document.createElement('button');
    button.className = className;
    return button;
}

const toggleDisabledCarouselNavButtons = () => {
    document.querySelector('.carousel__button-prev').toggleAttribute('disabled')
    document.querySelector('.carousel__button-next').toggleAttribute('disabled')
}
const carouselPrev = () => {
    toggleDisabledCarouselNavButtons()
    let items = document.querySelectorAll('.carousel__item');
    let wid = items[0].offsetWidth;
    prependHoursArrayOnDetail(items[items.length - 1].cloneNode(true))
    let carouselWrapper = document.querySelector('.carousel__wrapper')
    carouselWrapper
        .style.setProperty('--element-width', (wid + 25) * -1 + 'px')
    carouselWrapper.classList.add('prev-slide-animation');
    setTimeout(() => {
        delLastHoursArrayOnDetail();
        carouselWrapper.classList.remove('prev-slide-animation');
        toggleDisabledCarouselNavButtons()
    }, 300)
}

const carouselNext = () => {
    toggleDisabledCarouselNavButtons()
    let items = document.querySelectorAll('.carousel__item');
    let wid = items[0].offsetWidth;
    appendHoursArrayOnDetail(items[0].cloneNode(true));
    let carouselWrapper = document.querySelector('.carousel__wrapper')
    carouselWrapper
        .style.setProperty('--element-width', (wid + 25) * -1 + 'px')
    carouselWrapper.classList.add('next-slide-animation');
    setTimeout(() => {
        delFirstHoursArrayOnDetail()
        carouselWrapper.classList.remove('next-slide-animation');
        toggleDisabledCarouselNavButtons()
    }, 300)
}


//setters
const setCurrentCoords = (lat, lon) => {
    latitude = lat;
    longitude = lon;
}
const setCityName = (value) => {
    city = value;
    cityShow.innerHTML = value;
    setCityTitle('Погода в городе:');
}
const setForecastArray = (array) => {
    forecastArray = array;
    dailyForecast.innerHTML = '';
    if (forecastArray.length) {
        forecastArray.forEach(i => {
            let wrapper = createDiv('daily-forecast__wrapper')
            let item = createDiv('daily-forecast__item');
            let front = createDiv('daily-forecast__front')

            let weather = createDiv('weather')
            let weatherDescription = createDiv('weather__description');
            weatherDescription.innerHTML = i.weather.description;
            let weatherIcon = createImg('weather__icon', `assets/icons/${i.weather.icon}.png`)

            weather.append(weatherDescription)
            weather.append(weatherIcon)
            front.append(weather)

            let tempWrapper = createDiv('daily-forecast__temperature')
            tempWrapper.innerHTML = `${i.temp}&#176;С`

            front.append(tempWrapper)
            item.append(front)

            let back = createDiv('daily-forecast__back')

            let date = createDiv('daily-forecast__date')
            let dateTime = new Date(i.valid_date)
            date.innerHTML = `${getWeekDay(dateTime)} ${dateTime.getDate() < 10? '0'+dateTime.getDate() : dateTime.getDate()}.${(dateTime.getMonth()+1) < 10? ('0'+(dateTime.getMonth()+1)) : (dateTime.getMonth()+1)}.${dateTime.getFullYear()}`

            let button = createButton('daily-forecast__button default-button')
            button.innerHTML = 'Подробнее';
            button.addEventListener('click', () => {
                goToDetails(i.valid_date)
            })

            back.append(date)
            back.append(button)
            item.append(back)

            wrapper.append(item)
            dailyForecast.append(wrapper)
        })
    }
}
const setTwoDaysForecast = (array) => {
    twoDaysForecast = array;
}
const setCityTitle = (value) => {
    cityTitle.innerHTML = value;
}
const setDetail = (item, itemByHours = []) => {
    detail.innerHTML = '';

    let date = createDiv('detail-info__date')
    let dateTime = new Date(item.valid_date)
    date.innerHTML = `${getWeekDay(dateTime)} ${dateTime.getDate() < 10? '0'+dateTime.getDate() : dateTime.getDate()}.${(dateTime.getMonth()+1) < 10? ('0'+(dateTime.getMonth()+1)) : (dateTime.getMonth()+1)}.${dateTime.getFullYear()}`
    detail.append(date);

    let detailInfoWrapper = createDiv('detail-info__wrapper')
    let weatherIcon = createImg('detail-info__weather-icon', `assets/icons/${item.weather.icon}.png`)
    detailInfoWrapper.append(weatherIcon)

    let detailInfo = createDiv('detail-info__info')
    let weatherDescription = createDiv('detail-info__item');
    weatherDescription.innerHTML = item.weather.description;

    let temp = createDiv('detail-info__item')
    temp.innerHTML = `Средняя температура: ${item.temp}&#176;С`

    let tempHigh = createDiv('detail-info__item')
    tempHigh.innerHTML = `Самая высокая: ${item.high_temp}&#176;С`

    let tempLow = createDiv('detail-info__item')
    tempLow.innerHTML = `Самая низкая: ${item.low_temp}&#176;С`

    let windDir = createDiv('detail-info__item')
    windDir.innerHTML = `Направление ветра: ${item.wind_cdir}`

    let windSpd = createDiv('detail-info__item')
    windSpd.innerHTML = `Скорость ветра: ${item.wind_spd}м/с`

    let visible = createDiv('detail-info__item')
    visible.innerHTML = `Видимость: ${item.vis}км`

    let pop = createDiv('detail-info__item')
    pop.innerHTML = `Вероятность осадков: ${item.pop}%`

    detailInfo.append(weatherDescription)
    detailInfo.append(temp)
    detailInfo.append(tempHigh)
    detailInfo.append(tempLow)
    detailInfo.append(windDir)
    detailInfo.append(windSpd)
    detailInfo.append(visible)
    detailInfo.append(pop)

    detailInfoWrapper.append(detailInfo)

    let details = createDiv('detail-info__details')
    details.append(detailInfoWrapper)

    detailInfoWrapper = createDiv('detail-info__wrapper')
    weatherIcon = createImg('detail-info__weather-icon', `assets/sun.png`)
    detailInfoWrapper.append(weatherIcon)
    details.append(detailInfoWrapper)

    let sunrise = createDiv('detail-info__item')
    sunrise.innerHTML = `Восход солнца: ${new Date(item.sunrise_ts * 1000).getHours()}:${new Date(item.sunrise_ts * 1000).getMinutes() < 10? '0'+new Date(item.sunrise_ts * 1000).getMinutes() : new Date(item.sunrise_ts * 1000).getMinutes()}`

    let sunset = createDiv('detail-info__item')
    sunset.innerHTML = `Закат солнца: ${new Date(item.sunset_ts * 1000).getHours()}:${new Date(item.sunset_ts * 1000).getMinutes() < 10? '0'+new Date(item.sunset_ts * 1000).getMinutes() : new Date(item.sunset_ts * 1000).getMinutes()}`
    detailInfo = createDiv('detail-info__info')
    detailInfo.append(sunrise)
    detailInfo.append(sunset)
    detailInfoWrapper.append(detailInfo)
    details.append(detailInfoWrapper)

    detail.append(details);
    if (itemByHours.length) {
        console.log(itemByHours)
        // если есть данные по часам
        let carousel = createDiv('carousel');
        let carouselContainer = createDiv('carousel__container');
        let carouselWrapper = createDiv('carousel__wrapper');
        itemByHours.forEach(item => {
            let carouselItem = createDiv('carousel__item');

            let carouselWeather = createDiv('carousel__weather');
            let carouselIcon = createImg('carousel__weather-icon', `assets/icons/${item.weather.icon}.png`)
            let carouselDescription = createDiv('carousel__weather-description');
            carouselDescription.innerHTML = item.weather.description;

            carouselWeather.append(carouselIcon)
            carouselWeather.append(carouselDescription)

            let carouselHours = createDiv('carousel__info');
            carouselHours.innerHTML = `Время: ${new Date(item.timestamp_local).getHours()}ч`;

            let carouselTemp = createDiv('carousel__info');
            carouselTemp.innerHTML = `Температура: ${item.temp}&#176;С`;

            let carouselAppTemp = createDiv('carousel__info');
            carouselAppTemp.innerHTML = `По ощущениям: ${item.app_temp}&#176;С`;
            carouselItem.append(carouselWeather)
            carouselItem.append(carouselHours)
            carouselItem.append(carouselTemp)
            carouselItem.append(carouselAppTemp)
            carouselWrapper.append(carouselItem)
        })
        carouselContainer.append(carouselWrapper)
        carousel.append(carouselContainer)

        let carouselNavs = createDiv('carousel__navs');
        let styleForPrevButton = 'carousel__button-prev';
        let styleForNextButton = 'carousel__button-next';
        if (itemByHours.length <= 3) {
            if (itemByHours.length == 3){
                styleForPrevButton = styleForPrevButton+' carousel__button_three'
                styleForNextButton = styleForNextButton+' carousel__button_three'
            }
            if (itemByHours.length == 2) {
                styleForPrevButton = styleForPrevButton+' carousel__button_two'
                styleForNextButton = styleForNextButton+' carousel__button_two'
            }
            if (itemByHours.length == 1) {
                styleForPrevButton = styleForPrevButton+' carousel__button_one'
                styleForNextButton = styleForNextButton+' carousel__button_one'
            }
        }
        let carouselButtonPrev = createButton(styleForPrevButton)
        carouselButtonPrev.innerHTML = '<svg width="16" class="prevButton" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">\n' +
            '                    <path d="M8.75781 0.717285L1.75776 7.71733L8.75781 14.7174" stroke-width="2"/>\n' +
            '                </svg>'
        carouselButtonPrev.addEventListener('click', () => {
            carouselPrev()
        })
        let carouselButtonNext = createButton(styleForNextButton)
        carouselButtonNext.innerHTML = '<svg width="17" class="nextButton" height="16" fill="none" viewBox="0 0 17 16" xmlns="http://www.w3.org/2000/svg">\n' +
            '                    <path d="M7.75781 0.717285L14.7579 7.71733L7.75781 14.7174" stroke-width="2"/>\n' +
            '                </svg>'
        carouselButtonNext.addEventListener('click', () => {
            carouselNext()
        })

        carouselNavs.append(carouselButtonPrev)
        carouselNavs.append(carouselButtonNext)

        carousel.append(carouselNavs)
        details.append(carousel)

    }
}



window.addEventListener('load', () => {
    let setCoordsAndGetForecast = (lat, lon) => {
        setCurrentCoords(lat, lon);
        getDailyForecastByCoords()
    }
    getCurrentPosition(setCoordsAndGetForecast);
    backToForecast.addEventListener('click', () => {
        goToForecast();
    })
    citySearchForm
        .addEventListener('submit', (e) => {
            e.preventDefault();
            setCityName(cityInput.value);
            goToForecast();
            getDailyForecastByCity();
        })

})

