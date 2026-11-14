# Cipher Lab

Four classical ciphers with two real attacks: chi-squared Caesar cracking and a Vigenère cracker that finds the key length first.

## Features

- Caesar, Vigenère (letter or word key), Atbash and rail fence, all preserving punctuation
- Frequency histogram of the ciphertext against the English baseline, with index of coincidence and entropy
- Caesar cracker scoring all 26 shifts by chi-squared against English letter frequencies
- Vigenère cracker that searches key lengths by repeat coincidence and confirms each candidate by chi-squared

## Controls

Cipher buttons, key slider or word key, encrypt, decrypt and break buttons, editable text boxes; E encrypts, D decrypts, B breaks, R loads the sample

## Implementation

The attacks are genuine rather than decorative: Caesar shifts are scored with the standard chi-squared statistic over English letter frequencies, and the Vigenère cracker splits the text into columns for each candidate length, solves every column as a Caesar cipher, then decrypts and scores the whole result. The shortest length that survives that test wins, which avoids the classic confusion between a key and its multiples.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom custom classical cipher lab with Caesar, Vigenère, Atbash and rail fence plus chi-squared and key-length cryptanalysis; no third-party assets, libraries or network services)
