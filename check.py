import QieyunEncoder
import itertools
import re

han_regex = re.compile(r'[\u3006\u3007\u4e00-\u9fff\u3400-\u4dbf\U00020000-\U0002a6df\U0002a700-\U0002b73f\U0002b740-\U0002b81f\U0002b820-\U0002ceaf\U0002ceb0-\U0002ebef\U00030000-\U0003134f]')

def is_han(ch):
    '''
    Check if a character is a Han character.
    '''
    return bool(han_regex.fullmatch(ch))

with open('index.txt') as f:
    it = itertools.chain.from_iterable(f)
    def next_char():
        return next(it)

    while True:
        try:
            ch = next_char()
        except StopIteration:
            break

        if is_han(ch):
            last_ch = ch
            try:
                ch = next_char()
            except StopIteration:
                print('Error: Expected left parenthesis after ' + last_ch)
                exit(-1)
            assert ch == '(', 'Expected left parenthesis after ' + last_ch

            def inner():
                while True:
                    ch = next_char()
                    if ch == ')':
                        break
                    yield ch
            當前音韻描述 = ''.join(inner())

            try:
                當前音韻地位 = QieyunEncoder.音韻地位.from描述(當前音韻描述)
            except Exception as e:
                print('Wrong 音韻描述:', 當前音韻描述)
                exit(-1)
            # assert 當前音韻地位.最簡描述 == 當前音韻描述, f'音韻描述不是最簡形式：{當前音韻描述}→{當前音韻地位.最簡描述}'
