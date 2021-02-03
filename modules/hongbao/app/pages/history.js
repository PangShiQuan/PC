import 'hb_stylesheets/history.less';
import 'hb_stylesheets/pagination.less';
import $ from 'hb_vendors/pagination';

import {fetchHBDetails} from './hbApi';
import handleUnauthorize from './web';

function clearPreviousHistory() {
  const myHbPopup = document.getElementById('myHongbao');
  const hbTableBody = myHbPopup.getElementsByTagName('tbody')[0];
  while (hbTableBody.firstChild) {
    hbTableBody.removeChild(hbTableBody.firstChild);
  }
}

async function renderHBDetails({data, err}) {
  const myHbPopup = document.getElementById('myHongbao');
  const hbTableBody = myHbPopup.getElementsByTagName('tbody')[0];
  const amountEl = document.getElementById('totalAmount');
  const countEl = document.getElementById('totalCount');
  clearPreviousHistory();

  if (data && data.datas) {
    const {datas: myHbList, totalAmount, totalCount} = data;
    amountEl.textContent = `${totalAmount}元`;
    countEl.textContent = totalCount;
    myHbList.forEach(item => {
      const {processTime, delta, subType} = item;
      const tr = document.createElement('tr');
      const timeTd = document.createElement('td');
      const hbTypeTd = document.createElement('td');
      const hbAmountTd = document.createElement('td');
      timeTd.textContent = processTime;
      timeTd.classList.add('pc-only');
      hbTypeTd.textContent = subType;
      hbAmountTd.textContent = `${delta}元`;
      tr.appendChild(timeTd);
      tr.appendChild(hbTypeTd);
      tr.appendChild(hbAmountTd);
      hbTableBody.insertAdjacentElement('beforeend', tr);
    });
  } else if (err) {
    amountEl.textContent = `${0}元`;
    countEl.textContent = 0;
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 3;
    td.textContent = err.message;
    tr.appendChild(td);
    hbTableBody.insertAdjacentElement('beforeend', tr);

    if (err.statusCode === '401') {
      handleUnauthorize();
    }
  }
}

async function retrieveMyHb(accessToken, deviceToken, target = null) {
  const resp = await fetchHBDetails(accessToken, deviceToken, target);

  renderHBDetails(resp);

  return resp;
}

function onPageChange(accessToken, deviceToken) {
  return function onPageClick(pageNumber) {
    const start = (pageNumber - 1) * 5;
    retrieveMyHb(accessToken, deviceToken, {start});
  };
}

export default async function init(accessToken, deviceToken) {
  const myHbPopup = document.getElementById('myHongbao');

  myHbPopup.classList.remove('hide');

  const {data = {}} = await retrieveMyHb(accessToken, deviceToken);

  $('.pagination-row').pagination({
    cssStyle: 'history-pagination',
    displayedPages: 5,
    edges: 1,
    items: data.totalCount || 0,
    itemsOnPage: 5,
    onPageClick: onPageChange(accessToken, deviceToken),
  });
}
