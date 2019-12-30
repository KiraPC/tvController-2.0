module.exports = async (req, res) => {
    const { tvController } = res.locals;
    const { action } = req.params;

    try {
        await tvController.mediaControl(action);
        res.send('Success');
    } catch (error) {
        res.status(500).send('Error');
    }
};
