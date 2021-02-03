import React from 'react';

function renderDate(
  data,
  retainSecond = true,
  breakline = false,
  onlyDate = false,
) {
  if (!data) return <span />;

  if (onlyDate) return data.substring(0, data.indexOf('T'));

  let text = data.replace('T', ' ');

  if (!retainSecond) text = text.slice(0, text.lastIndexOf(':'));

  if (breakline) {
    return (
      <React.Fragment>
        <span>{text.substring(0, text.indexOf(' '))}</span>
        <br />
        <span>{text.substring(text.indexOf(' '))}</span>
      </React.Fragment>
    );
  }

  return <span>{text}</span>;
}

export default renderDate;
