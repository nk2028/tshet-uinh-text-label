import Qieyun
import sys
from xml.dom.minidom import parseString

with open('index.html') as f:
	for i, line in enumerate(f):
		try:
			root = parseString(line)
		except Exception as e:
			print('Line', i, e, file=sys.stderr)
			exit(1)

		for rt in root.getElementsByTagName('rt'):
			描述 = rt.firstChild.data
			try:
				# this function will perform checks on 描述
				Qieyun.音韻地位.from描述(描述)
			except Exception as e:
				print(描述, e, file=sys.stderr)
				exit(1)
