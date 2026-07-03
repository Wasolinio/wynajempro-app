/* Props dla klikalnych elementów niebędących <button> (karta, wiersz tabeli, pasek
   kalendarza): mysz + klawiatura (Enter/Spacja) + semantyka role=button.
   Guard e.target: Enter na przycisku wewnątrz wiersza nie może otwierać wiersza. */
export const clickableProps = (onClick) => ({
  onClick,
  role: 'button',
  tabIndex: 0,
  onKeyDown: (e) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e); }
  },
});
