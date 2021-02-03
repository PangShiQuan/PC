import React, {useEffect} from 'react';
import {Picker} from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';

const ChatboxEmoji = props => {
  const {emojiClick, showModal} = props;

  useEffect(() => {
    const emojiMarts = document.querySelectorAll('.emoji-mart');
    Array.from(emojiMarts).forEach(item => {
      if (item.querySelector('.emoji-mart-bar'))
        item.querySelector('.emoji-mart-bar').remove();
      if (item.querySelector('.emoji-mart-search'))
        item.querySelector('.emoji-mart-search').remove();
    });
  }, []);

  return (
    <Picker
      perLine={6}
      showPreview={false}
      showSkinTones={false}
      useButton={false}
      onClick={emojiClick}
      include={['people']}
      style={{
        position: 'absolute',
        bottom: 'calc(100% + 5px)',
        left: 10,
        display: showModal ? '' : 'none',
      }}
      i18n={{
        search: '搜索',
        clear: '清除', // Accessible label on "clear" button
        notfound: '未找到',
        categories: {
          search: '搜索结果',
          recent: '常用',
          people: '表情符号与人物',
          nature: '动物与自然',
          foods: '食物与饮料',
          activity: '活动',
          places: '旅行与地点',
          objects: '物体',
          symbols: '符号',
          flags: '旗帜',
        },
      }}
    />
  );
};

export default React.memo(ChatboxEmoji);
