import React, { useEffect, useState, useRef } from 'react'
import Tesseract, { TesseractWorker } from 'tesseract.js'
import ReactCamera, { FACING_MODES, IMAGE_TYPES } from 'react-html5-camera-photo'
import 'react-html5-camera-photo/build/css/index.css'

import phoneNumberToWords from '../lib/phone-number-to-words'
import formatPhoneNumber from '../lib/format-phone-number'

const rawDictionary = require('../static/dictionary')
const dictionary = new Map(Object.entries(rawDictionary))

const technology = '8324665649'
const connection = '2666328466'

const ErrorMessage = ({ error }) =>
  <div>
    { error }
  </div>

const PhoneWords = ({ phoneNumber }) => {
  const [ words, setWords ] = useState([])

  useEffect(() => {
    const list = phoneNumberToWords(dictionary)(phoneNumber)
    console.log(list)
    setWords(list)
  }, [phoneNumber])

  return (
    <>
      <p>Formated: {formatPhoneNumber(phoneNumber)}</p>

      <ul>
        { words.map(word => <li key={word}>{word}</li>) }
      </ul>

      { words.length == 0 && <p>No words found</p> }
    </>
  )
}

const Process = ({ photo, onReset }) => {
  const [ progress, setProgress ] = useState({ state: '', progress: '' })
  const [ processing, setProcessing ] = useState(false)
  const [ phoneNumber, setPhoneNumber ] = useState('')
  const [ error, setError ] = useState(false)
  const imgRef = useRef(null)

  const handleProgress = (p) => {
    setProgress(p)
  }

  const handleText = (result) => {
    setProcessing(false)

    console.log('Results', { result })

    const text = result.text.replace(/\D/g, '')

    if (text == '') {
      setError('Did not find phone number in image')
    } else {
      setPhoneNumber(text)
    }
  }

  useEffect(() => {
    setError(false)
    setProcessing(true)

    const worker = new TesseractWorker({
      langPath: '/static',
    })

    try {
    worker.recognize(photo, 'eng', { tessedit_char_whitelist: '0123456789' }).progress(handleProgress).then(handleText)
    } catch (err) {
      console.error(err)
    }

    return () => worker.terminate()
  }, [photo])

  if (error) {
    return (
      <>
        <ErrorMessage error={error} />
        <button onClick={onReset}>Reset</button>
      </>
    )
  }

  console.log('Phone Number is', phoneNumber)
  console.log('Progress is', progress)

  return (
    <>
      <img ref={imgRef} src={photo} width="100%" height="100%" />
      <p>{ progress.state }</p>
      <p>Found: { phoneNumber }</p>
      { phoneNumber.length > 0 && <PhoneWords phoneNumber={phoneNumber} /> }
      { !processing && <button onClick={onReset}>Reset</button> }
    </>
  )
}

const Camera = ({ onTakePhoto }) =>
  <ReactCamera
    onTakePhoto={onTakePhoto}
    idealFacingMode={FACING_MODES.ENVIRONMENT}
    imageType={IMAGE_TYPES.PNG}
    isFullScreen={true}
    isImageMirror={false}
    isMuted={true}
  />

export default () => {
  const [view, setView] = useState('camera')
  const [photo, setPhoto] = useState()

  const handleTakePhoto = (dataUri) => {
    console.log("Photo Taken", { photo: dataUri })

    setPhoto(dataUri)
    setView('process')
  }

  const handleReset = () => {
    setPhoto()
    setView('camera')
  }

  return (
    <>
      <h1>Phone Words</h1>
      { view == 'process' ? <Process photo={photo} onReset={handleReset}/> : <Camera onTakePhoto={handleTakePhoto} /> }
    </>
   )
}
