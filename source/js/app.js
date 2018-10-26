'use strict';

var mainNav = document.querySelector('.main-nav');
var mainNavToggle = mainNav.querySelector('.main-nav__toggle');
var mainNavToggleText = mainNav.querySelector('.main-nav__toggle span');

if (!mainNav.classList.contains('main-nav--closed')) {
  mainNav.classList.add('main-nav--closed');
}

mainNavToggle.addEventListener('click', function() {
  if (mainNav.classList.contains('main-nav--closed')) {
    mainNav.classList.remove('main-nav--closed');
    mainNav.classList.add('main-nav--opened');
    mainNavToggleText.innerHTML = 'Закрыть меню';
  } else {
    mainNav.classList.add('main-nav--closed');
    mainNav.classList.remove('main-nav--opened');
    mainNavToggleText.innerHTML = 'Открыть меню';
  }
});
