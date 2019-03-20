import React from 'react';
import styles from './Card.module.scss';

const Card = ({ id }) => {
  return <div className={styles['base']}>Card {id}</div>;
};

export default Card;
