<motion.div
  className="congrats-modal"
  initial={{ opacity: 0, scale: 0.92, y: 30 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.95, y: 15 }}
  transition={{ type: "spring", stiffness: 200, damping: 22 }}
>
  <button className="close-btn" onClick={onClose}>
    <FiX size={18} />
  </button>

  {/* Header icon */}
  <div className="icon-wrapper">
    {current?.icon && <current.icon size={28} />}
  </div>

  {/* Text */}
  <div className="content-area">
    <AnimatePresence mode="wait">
      <motion.div
        key={currentMessage}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
      >
        <h2 className="congrats-title">{current?.title}</h2>

        <p className="congrats-message">{current?.message}</p>
      </motion.div>
    </AnimatePresence>

    {user?.fullName && (
      <p className="user-greeting">
        Hello, {user.fullName.split(" ")[0]}
      </p>
    )}
  </div>

  {/* Progress */}
  <div className="progress-wrapper">
    {currentMessages.map((_, index) => (
      <motion.span
        key={index}
        className="progress-dot"
        animate={{
          width: index === currentMessage ? 22 : 6,
          opacity: index === currentMessage ? 1 : 0.3,
        }}
      />
    ))}
  </div>

  {/* Footer */}
  <div className="bottom-note">
    Premium travel experience is ready for you.
  </div>
</motion.div>