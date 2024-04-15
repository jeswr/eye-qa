import { keyParams, signParams } from '@jeswr/rdfjs-sign';
import { subtle } from 'crypto';

const key = {
  key_ops: [
    'sign',
  ],
  ext: true,
  kty: 'EC',
  x: 'bEBNXSoDNbLhgMioYgpspgFtKfjh4hVbOhdLp63CL33mv4B4eSJP3-qqO72YCCD4',
  y: 'Fd1Kq9g25OBw2dRsEgpVemok_DnG0HkCScixFXWw1TTX67VkYZHKI13L4GiTSOEZ',
  crv: 'P-384',
  d: 'iTgl-NrIoSXQvtqYCs3jIftyHJdQkhPRgLoFvj1a5JuzvvvV2gHPqfHXNmBRSruz',
};

subtle.importKey('jwk', key, keyParams, true, ['sign']).then(
  (privateKey) => subtle.sign(signParams, privateKey, Buffer.from('be56961c1318a543ba136dc96486453d48608996f493b9bf535ae5a363fc85c9', 'utf8')),
).then((buffer) => Buffer.from(buffer).toString('base64'))
  .then(console.log)
  .catch(console.error);
