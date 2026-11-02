from rhb_gen_ia import cfg
cfg('holy-blissful-martyr', 'The Holy Blissful Martyr Saint Thomas of Canterbury', 'O Santo Bem-aventurado Mártir São Tomás de Cantuária',
 "Benson's short life of St Thomas Becket (1910) for the Westminster Library: his birth, youth and rise, the chancellor and archbishop, the troubles in England, exile and return, and his passion, death and coronation in glory.",
 "A breve vida de São Tomás Becket por Benson (1910), para a Westminster Library: nascimento, juventude e ascensão, o chanceler e arcebispo, os problemas na Inglaterra, o exílio e o regresso, e sua paixão, morte e coroação na glória.",
 1910, ('London: Sands & Co., 1910', 1910), 'holyblissfulmart00bensuoft',
 [[180, 'Introduction'], [376, 'I. Birth, Youth and Rise'], [923, 'II. Chancellor and Archbishop'], [1704, 'III. Troubles in England'], [2813, 'IV. Exile and Return'], [4277, 'V. Passion and Death'], [5224, 'VI. Coronation']], 180, 5678, died=1914)
cfg('non-catholic-denominations', 'Non-Catholic Denominations', 'Denominações Não Católicas',
 "Benson's survey of 1910 of the non-Catholic religions of England: in Part I the Established Church (the High Church, Ritualist, extreme, Low Church and Broad Church parties) and in Part II the non-episcopal sects: Presbyterians, Nonconformists, Congregationalists, Wesleyans, Quakers and modern mystics.",
 "O panorama de Benson (1910) das religiões não católicas da Inglaterra: na Parte I a Igreja Estabelecida (partidos High Church, ritualista, extremo, Low Church e Broad Church) e na Parte II as seitas não episcopais: presbiterianos, não conformistas, congregacionalistas, wesleyanos, quacres e místicos modernos.",
 1910, ('London: Catholic Truth Society, 1910', 1910), 'tnoncatholicdenom00bensuoft', None, 416, r'^\s*(THE END|INDEX)\s*$', died=1914,
 chap_re=r'^CHAPTER\s+(?P<n>[IVXL]+)\.?$', part_re=r'^PART\s+[IVX]+\.$', title_next=True, label='Chapter', part_title_next=True)
