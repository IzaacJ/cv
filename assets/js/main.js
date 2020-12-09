import { cv } from './lib/cv.js';

var headerHeight = $('header').outerHeight(true) + 10;
$('main').css('padding-top', headerHeight);

cv.start();