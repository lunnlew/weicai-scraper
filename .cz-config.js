module.exports = {
    types: [
        { value: '特性', name: '特性:   一个新的特性' },
        { value: '修复', name: '修复:   修复一个Bug' },
        { value: '文档', name: '文档:   变更文档' },
        {
            value: '格式',
            name: '格式:   不影响代码意义的改变，(空白符, 可去掉的分号, 格式化等)',
        },
        {
            value: '重构',
            name: '重构:   代码重构，注意和特性、修复区分开',
        },
        {
            value: '性能',
            name: '性能:   提升性能',
        },
        { value: '测试', name: '测试:   添加一个测试' },
        {
            value: '杂项',
            name: '杂项:   构建过程及辅助工具、库的改变，如文档生成',
        },
        { value: '回滚', name: '回滚:   代码回退' },
        { value: '进展', name: '进展:   项目进展' },
    ],

    scopes: [{ name: 'WeChatCtl' }, { name: 'WeChatHelper' }, { name: 'WeicaiBinding' }, { name: 'backend' }, { name: 'renderer' }, { name: 'docs' }, { name: 'deps' }],

    allowTicketNumber: false,
    isTicketNumberRequired: false,
    ticketNumberPrefix: 'TICKET-',
    ticketNumberRegExp: '\\d{1,5}',

    // it needs to match the value for field type. Eg.: 'fix'
    /*
    scopeOverrides: {
      fix: [
        {name: 'merge'},
        {name: 'style'},
        {name: 'e2eTest'},
        {name: 'unitTest'}
      ]
    },
    */
    // override the messages, defaults are as follows
    messages: {
        type: "选择提交类型:",
        scope: '\n选择本次变更类别(可选):',
        // used if allowCustomScopes is true
        customScope: '自定义变更类别:',
        subject: '重要变更的简短描述:\n',
        body: '变更内容的详细描述(可选)。使用|换行:\n',
        breaking: '非兼容性说明(可选):\n',
        footer: '关联关闭的issue，例如：#31, #34:\n',
        confirmCommit: '确定进行本次提交吗?',
    },

    allowCustomScopes: true,
    allowBreakingChanges: ['特性', '修复'],
    // skip any questions you want
    skipQuestions: ['body'],

    // limit subject length
    subjectLimit: 100,
    // breaklineChar: '|', // It is supported for fields body and footer.
    // footerPrefix : 'ISSUES CLOSED:'
    // askForBreakingChangeFirst : true, // default is false
};