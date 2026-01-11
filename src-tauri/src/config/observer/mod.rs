//! 配置观察者模块
//!
//! 提供基于观察者模式的全局配置管理系统

mod events;
mod manager;
mod observers;
mod subject;
mod traits;

pub use events::{
    AmpConfigChangeEvent, ConfigChangeEvent, ConfigChangeSource, CredentialPoolChangeEvent,
    EndpointProvidersChangeEvent, FullReloadEvent, InjectionChangeEvent, LoggingChangeEvent,
    NativeAgentChangeEvent, RetryChangeEvent, RoutingChangeEvent, ServerChangeEvent,
};
pub use manager::{GlobalConfigManager, GlobalConfigManagerState};
pub use observers::{
    DefaultProviderRefObserver, EndpointObserver, InjectorObserver, LoggingObserver,
    RouterObserver, TauriObserver,
};
pub use subject::{ConfigSubject, CONFIG_CHANGED_EVENT, CONFIG_RELOAD_EVENT};
pub use traits::{ConfigObserver, FnObserver, SyncConfigObserver, SyncObserverWrapper};
