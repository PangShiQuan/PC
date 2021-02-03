export function sealPhoneNumberChar(phoneNumber) {
    const sealChar = '****';
    const phoneNumberLength = phoneNumber.length;
    return phoneNumber.substr(0, 4) + sealChar + phoneNumber.substr(8, phoneNumberLength);
}